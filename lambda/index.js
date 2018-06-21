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

const SOURCE_BUCKET = process.env.SOURCE_BUCKET;
const URL = process.env.URL;
const ALLOWED_DIMENSIONS = new Set();
const THUMBNAIL_DESTINATION_BUCKET = process.env.THUMBNAIL_DESTINATION_BUCKET;

if (process.env.ALLOWED_DIMENSIONS) {
  const dimensions = process.env.ALLOWED_DIMENSIONS.split(/\s*,\s*/);
  dimensions.forEach((dimension) => ALLOWED_DIMENSIONS.add(dimension));
}

module.exports.handler = function(event, context, callback) {
  const key = event.queryStringParameters.key;
  const match = key.match(/((\d+)x(\d+))\/(.*)/);
  log('Getting dimensions', key, match);
  const dimensions = match[1];
  const width = parseInt(match[2], 10);
  const height = parseInt(match[3], 10);
  const originalKey = match[4];

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
    .then(buffer => S3.putObject({
        Body: buffer,
        Bucket: THUMBNAIL_DESTINATION_BUCKET,
        ContentType: 'image/png',
        Key: key,
      }).promise()
    )
    .then(() => callback(null, {
        statusCode: '301',
        headers: {'location': `${URL}/${key}`},
        body: '',
      })
    )
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
  return object.ACL === 'private' ? S3.getSignedUrl('getObject', {Bucket: SOURCE_BUCKET, Key: originalKey})
    : `https://s3.amazonaws.com/${bucket}/${key}`;
};

