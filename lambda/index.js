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

if (process.env.ALLOWED_DIMENSIONS) {
  const dimensions = process.env.ALLOWED_DIMENSIONS.split(/\s*,\s*/);
  dimensions.forEach((dimension) => ALLOWED_DIMENSIONS.add(dimension));
}

module.exports.handler = function(event, context, callback) {
  const url = `https://s3.amazonaws.com/${SOURCE_BUCKET}/${event.queryStringParameters.key.match(/((\d+)x(\d+))\/(.*)/)[4]}`;
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
};

const handler = (event, context, callback) => {
  const key = event.queryStringParameters.key;
  const match = key.match(/((\d+)x(\d+))\/(.*)/);
  log('Getting dimensions', key, match);
  const dimensions = match[1];
  const width = parseInt(match[2], 10);
  const height = parseInt(match[3], 10);

  const { originalKey } = getKeyInformation(match[4]);

  if(ALLOWED_DIMENSIONS.size > 0 && !ALLOWED_DIMENSIONS.has(dimensions)) {
    callback(null, {
      statusCode: '403',
      headers: {},
      body: '',
    });
    return;
  }

  log('Getting object', originalKey);

  S3.getObject({Bucket: SOURCE_BUCKET, Key: originalKey}).promise()
    .then(data => {
      log('Got object');

      log('Getting object type');
      const OBJECT_TYPE = getObjectType(data);
      log('Object type is: ', OBJECT_TYPE);

      switch (OBJECT_TYPE) {
        case FILE_TYPE_KEYS.image:
          return Sharp(data.Body)
            .resize(width, height)
            .toFormat('png')
            .toBuffer();
        case FILE_TYPE_KEYS.video:
          log('Getting video signed URL');

          const OBJECT_URL = getOriginalObjectUrl(data, SOURCE_BUCKET, originalKey);

          log('Got video signed URL:', OBJECT_URL);
          return Generators.video(OBJECT_URL, width, height);
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
        Key: key,
      }).promise();
    })
    .then(() => {
      log('Thumbnail saved to bucket, returning redirect:', `${URL}/${key}`);
      return callback(null, {
        statusCode: '301',
        headers: {'location': `${URL}/${key}`},
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
  return object.ACL === 'private' ? S3.getSignedUrl('getObject', {Bucket: bucket, Key: originalKey})
    : `https://s3.amazonaws.com/${bucket}/${key}`;
};

const getCanAccess = url => {
  return new Promise((resolve, reject) => {
    let bytesReceived = 0;
    log('Getting head of file to check permissions: ', url);
    https.get(url, res => {
      log('Got response:', res.statusCode);
      resolve(res.statusCode === 200);
      // log('Getting head of file: ', url);
      // res.pipe(file);
      // res.on('data', chunk => {
      //   bytesReceived += chunk.length;
      //   log('Received video chunk', chunk.length, bytesReceived);
      //   if (bytesReceived > 1000) {
      //     res.destroy();
      //     file.close();
      //     log('Got video head, getting media info');
      //     _getMediaInfo(DEFAULT_VIDEO_HEAD_FILENAME)
      //       .then(resolve, reject);
      //   }
      // });
    });
  });
};

/**
 * Returns the key information
 * @param key
 * @returns {{originalKey: string, originalParams: string|undefined}}
 */
const getKeyInformation = key => {
  const match = key.match(/((\d+)x(\d+))\/(.*)/);
  log('Getting dimensions', key, match);

  const dimensions = match[1];
  const width = parseInt(match[2], 10);
  const height = parseInt(match[3], 10);
  const originalKeyWithParams = match[4];

  const hasParams = originalKeyWithParams.indexOf('?') >= 0;
  const originalKey =  hasParams ? originalKeyWithParams.substr(0, originalKeyWithParams.indexOf('?')) : key;
  const originalParams = hasParams ? originalKeyWithParams.substr(originalKeyWithParams.indexOf('?')) : undefined;

  const originalPathInfo = getPathInfo(originalKeyWithParams);
  const fullPathInfo = getPathInfo(key);

  return {
    originalKey,
    originalParams,
    key: key,
    keyWithParams: key
  };
};

/**
 *
 * @param path
 * @returns {{path: *, pathWithoutParams: string, params: any, hasParams: boolean}}
 */
const getPathInfo = path => {
  const hasParams = path.indexOf('?') >= 0;
  const pathWithoutParams =  hasParams ? path.substr(0, path.indexOf('?')) : key;
  const params = hasParams ? path.substr(path.indexOf('?')) : undefined;

  return {
    path,
    pathWithoutParams,
    params,
    hasParams
  }

};