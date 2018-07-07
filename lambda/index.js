'use strict';
process.env.PATH = process.env.PATH + ":/var/task";

const FILE_TYPE_KEYS = {
  video: 'VIDEO',
  image: 'IMAGE',
  pdf: 'PDF',
  other: 'OTHER'
};

const AWS = require('aws-sdk');

const Generators = {
  video: require('./generators/generate-video-thumbnail').generate,
  image: require('./generators/generate-image-thumbnail').generate,
  pdf: require('./generators/generate-pdf-thumbnail')
};

const log = require('./util/log').log;

const S3 = new AWS.S3({
  signatureVersion: 'v4',
});
const Sharp = require('sharp');
const https = require('https');

const SOURCE_BUCKET = process.env.SOURCE_BUCKET;
const URL = process.env.URL;
const ALLOWED_DIMENSIONS = new Set();
const THUMBNAIL_DESTINATION_BUCKET = process.env.THUMBNAIL_DESTINATION_BUCKET;

const VIDEO_SCREENSHOT_TIME_MARK = process.env.VIDEO_SCREENSHOT_TIME_MARK || 5;
const SECURED = process.env.SECURED || true;

if (process.env.ALLOWED_DIMENSIONS) {
  const dimensions = process.env.ALLOWED_DIMENSIONS.split(/\s*,\s*/);
  dimensions.forEach((dimension) => ALLOWED_DIMENSIONS.add(dimension));
}

module.exports.handler = function(event, context, callback) {
  const info = getKeyInformation(event.queryStringParameters.key);
  const url = `https://${SOURCE_BUCKET}.s3.amazonaws.com/${info.originalKeyWithParams}`;

  log('Checking for permission', event.queryStringParameters.key, info);
  if (!SECURED || SECURED === 'false') {
    handler(event, context, callback);
  } else {
    getCanAccess(url)
      .then(canAccess => {
        if (canAccess) {
          handler(event, context, callback);
        } else {
          log('User does not have access to URL: ', url);
          callback(null, {
            statusCode: '403',
            headers: {},
            body: '',
          });
        }
      })
  }
};

const handler = (event, context, callback) => {
  const keyInfo = getKeyInformation(event.queryStringParameters.key);

  log('Getting dimensions',keyInfo);

  if(ALLOWED_DIMENSIONS.size > 0 && !ALLOWED_DIMENSIONS.has(keyInfo.dimensions)) {
    callback(null, {
      statusCode: '403',
      headers: {},
      body: '',
    });
    return;
  }

  log('Getting object', keyInfo.originalKeyWithParams);

  S3.getObject({Bucket: SOURCE_BUCKET, Key: keyInfo.originalKey}).promise()
    .then(data => {
      log('Got object');

      log('Getting object type');
      const OBJECT_TYPE = getObjectType(data);
      log('Object type is: ', OBJECT_TYPE);

      switch (OBJECT_TYPE) {
        case FILE_TYPE_KEYS.image:
          return Sharp(data.Body)
            .resize(keyInfo.width, keyInfo.height)
            .toFormat('png')
            .toBuffer();
        case FILE_TYPE_KEYS.video:
          log('Getting video signed URL');

          const OBJECT_URL = getOriginalObjectUrl(data, SOURCE_BUCKET, keyInfo.originalKey);

          log('Got video signed URL:', OBJECT_URL);
          return Generators.video(OBJECT_URL, keyInfo.width, keyInfo.height, VIDEO_SCREENSHOT_TIME_MARK);
        case FILE_TYPE_KEYS.pdf:
        case FILE_TYPE_KEYS.other:
          break;
      }
    })
    .then(buffer => {
      log('Got thumbnail buffer, saving it to ', THUMBNAIL_DESTINATION_BUCKET);
      return S3.putObject({
        Body: buffer,
        Bucket: THUMBNAIL_DESTINATION_BUCKET,
        ContentType: 'image/png',
        Key: keyInfo.thumbnailKey,
      }).promise();
    })
    .then(() => {
      log('Thumbnail saved to bucket, returning redirect:', `${URL}/${keyInfo.thumbnailKey}`);
      return callback(null, {
        statusCode: '301',
        headers: {'location': `${URL}/${keyInfo.thumbnailKey}`},
        body: '',
      });
    })
    .catch(err => callback(err))
};

/**
 * Returns the object type
 * @returns string ('VIDEO', 'IMAGE', 'PDF', 'OTHER' for everything else)
 * @param object
 */
const getObjectType = object => {
  console.log('Getting object type:', object);
  if (object.ContentType.indexOf('video') >= 0) {
    return FILE_TYPE_KEYS.video;
  } else if (object.ContentType.indexOf('image') >= 0) {
    return FILE_TYPE_KEYS.image;
  } else if (object.ContentType.indexOf('pdf') >= 0) {
    return FILE_TYPE_KEYS.pdf;
  } else {
    return FILE_TYPE_KEYS.other;
  }
};

const getOriginalObjectUrl = (object, bucket, key) => {
  return object.ACL === 'private' || object.ACL === undefined ? S3.getSignedUrl('getObject', {Bucket: bucket, Key: key})
    : `https://s3.amazonaws.com/${bucket}/${key}`;
};

const getCanAccess = url => {
  return new Promise((resolve, reject) => {
    let bytesReceived = 0;
    log('Getting head of file to check permissions: ', url);
    https.get(url, res => {
      log('Got response:', res.statusCode);
      resolve(res.statusCode === 200);
    });
  });
};

/**
 *
 * @param key
 * @returns {{originalKey: string, originalParams: any, originalKeyWithParams: string, thumbnailKey: string, thumbnailKeyWithParams: *, thumbnailKeyParams: any, width: number, height: number, dimensions: *}}
 */
const getKeyInformation = key => {
  const match = key.match(/((\d+)x(\d+))\/(.*)/);

  const originalPathInfo = getPathInfo(match[4]);
  const fullPathInfo = getPathInfo(key);

  return {
    originalKey: originalPathInfo.pathWithoutParams,
    originalParams: originalPathInfo.params,
    originalKeyWithParams: originalPathInfo.path,
    thumbnailKey: fullPathInfo.pathWithoutParams,
    thumbnailKeyWithParams: key,
    thumbnailKeyParams: fullPathInfo.params,
    width: parseInt(match[2], 10),
    height: parseInt(match[3], 10),
    dimensions: match[1]
  };
};

/**
 *
 * @param path
 * @returns {{path: *, pathWithoutParams: string, params: any, hasParams: boolean}}
 */
const getPathInfo = path => {
  const hasParams = path.indexOf('?') >= 0;

  let pathWithParams = path;

  const pathWithoutParams =  hasParams ? path.substr(0, path.indexOf('?')) : path;
  let params = hasParams ? path.substr(path.indexOf('?')) : undefined;

  if (params.indexOf('?params=') >= 0) {
    params = decodeHexparams(params.replace('?params=', ''));
    pathWithParams = `${pathWithoutParams}?${params}`
  }

  return {
    path: pathWithParams,
    pathWithoutParams,
    params,
    hasParams
  }
};

const decodeHexparams = hexParams => {
  // https://gist.github.com/valentinkostadinov/5875467
  let s = '';
  for (let i = 0; i < hexParams.length; i+=2) {
    s += String.fromCharCode(parseInt(hexParams.substr(i, 2), 16))
  }
  return decodeURIComponent(encodeURI(s))
};
