const Sharp  = require('sharp');

const DEFAULT_THUMBNAIL_FORMAT = 'png';

/**
 * Returns a thumbnail buffer
 * @param object the s3 object
 * @param width the desired width
 * @param height the desired height
 * @returns {buffer}
 */
module.exports.generate = (object, width, height) => {
  return Sharp(object.Body)
    .resize(width, height)
    .toFormat(DEFAULT_THUMBNAIL_FORMAT)
    .toBuffer();
};
