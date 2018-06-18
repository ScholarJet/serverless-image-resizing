'use strict';

const FILE_TYPE_KEYS = {
  video: 'VIDEO',
  image: 'IMAGE',
  pdf: 'PDF',
  other: 'OTHER'
};

const AWS = require('aws-sdk');
const S3 = new AWS.S3({
  signatureVersion: 'v4',
});
// const Sharp = require('sharp');

import * as Sharp from 'sharp';

const BUCKET = process.env.BUCKET;
const URL = process.env.URL;
const ALLOWED_DIMENSIONS = new Set();

if (process.env.ALLOWED_DIMENSIONS) {
  const dimensions = process.env.ALLOWED_DIMENSIONS.split(/\s*,\s*/);
  dimensions.forEach((dimension) => ALLOWED_DIMENSIONS.add(dimension));
}

export const handler = function(event, context, callback) {
  const key = event.queryStringParameters.key;
  const match = key.match(/((\d+)x(\d+))\/(.*)/);
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

  S3.getObject({Bucket: BUCKET, Key: originalKey}).promise()
    .then(data => Sharp(data.Body)
      .resize(width, height)
      .toFormat('png')
      .toBuffer()
    )
    .then(buffer => S3.putObject({
        Body: buffer,
        Bucket: BUCKET,
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

const generateThumbnail = object => {

};

