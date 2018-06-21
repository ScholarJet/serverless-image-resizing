const VideoThumbnailGenerator = require('./generators/generate-video-thumbnail');

const path = 'https://firebasestorage.googleapis.com/v0/b/scholarjet-prod/o/ScholarJet-Full-Video.webm?alt=media&token=ce0bb308-6975-4ed7-a11b-f34c2f4bed15';

VideoThumbnailGenerator
  .generate(path, null, null, 5, 1, './video-thumbnail.jpg')
  .then(res => res);
