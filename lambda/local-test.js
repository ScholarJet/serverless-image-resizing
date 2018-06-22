process.env.PATH = process.env.PATH + ":/home/francisco/Projects/ScholarJet/serverless-image-resizing/lambda";

const VideoThumbnailGenerator = require('./generators/generate-video-thumbnail');

// const path = 'https://firebasestorage.googleapis.com/v0/b/scholarjet-prod/o/ScholarJet-Full-Video.webm?alt=media&token=ce0bb308-6975-4ed7-a11b-f34c2f4bed15';
const path = 'https://scholarjet-development.s3.amazonaws.com/files/201eb871-4fd4-492f-9dc3-a3947c555ef6/b8cf3a16-529b-4263-bde7-87251d810d21/2w9/webM/2w9.webm?AWSAccessKeyId=AKIAIYIJDNQSVPTV7LKA&Expires=1529655828&Signature=GboyfysVkYLl31urpUShwr4b1es%3D';

VideoThumbnailGenerator
  .generate(path, null, null, 5, 1, './video-thumbnail.jpg')
  .then(res => res);
