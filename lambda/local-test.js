// process.env.PATH = process.env.PATH + ":/home/francisco/Projects/ScholarJet/serverless-image-resizing/lambda";
//
// const VideoThumbnailGenerator = require('./generators/generate-video-thumbnail');
//
// // const path = 'https://firebasestorage.googleapis.com/v0/b/scholarjet-prod/o/ScholarJet-Full-Video.webm?alt=media&token=ce0bb308-6975-4ed7-a11b-f34c2f4bed15';
// const path = 'https://scholarjet-development.s3.amazonaws.com/files/201eb871-4fd4-492f-9dc3-a3947c555ef6/b8cf3a16-529b-4263-bde7-87251d810d21/2w9/webM/2w9.webm?AWSAccessKeyId=AKIAIYIJDNQSVPTV7LKA&Expires=1529655828&Signature=GboyfysVkYLl31urpUShwr4b1es%3D';
//
// VideoThumbnailGenerator
//   .generate(path, null, null, 5, 1, './video-thumbnail.jpg')
//   .then(res => res);

const decodeHexparams = hexParams => {
  // https://gist.github.com/valentinkostadinov/5875467
  let s = '';
  for (let i = 0; i < hexParams.length; i+=2) {
    s += String.fromCharCode(parseInt(hexParams.substr(i, 2), 16))
  }
  return decodeURIComponent(encodeURI(s))
};


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

const path = '600x300/files/201eb871-4fd4-492f-9dc3-a3947c555ef6/b8cf3a16-529b-4263-bde7-87251d810d21/10-Doug_Weich_SG.jpg?params=3f4157534163636573734b657949643d414b49414959494a444e515356505456374c4b4126457870697265733d31353239373136393334265369676e61747572653d7736445a506c6e3832756e333564577264716e4f4d47343372554d3d';
console.log(getPathInfo(path));

