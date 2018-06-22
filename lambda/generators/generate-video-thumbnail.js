// Used to run commands
const child_process = require('child_process');

const mediaInfo = require('mediainfo-wrapper');

const fs = require('fs');
const https = require('https');
const DEFAULT_TIME_MARK = 5;

const DEFAULT_QSCALEV = '2';
const DEFAULT_FRAMES = '1';

const DEFAULT_TEMP_FILENAME = '/tmp/vid-screenshot.jpg';

const log = require('../util/log').log;

const DEFAULT_VIDEO_HEAD_FILENAME = '/tmp/video-head';

const DEFAULT_VIDEO_CHUNK_SIZE = process.env.DEFAULT_VIDEO_CHUNK_SIZE || 15240;


/**
 *
 * @param objectPath
 * @param width
 * @param height
 * @param timeMark
 * @param count
 * @param outputFilename
 * @returns {*}
 */
module.exports.generate = (objectPath,
                  width,
                  height,
                  timeMark = DEFAULT_TIME_MARK,
                  count = 1,
                  outputFilename = DEFAULT_TEMP_FILENAME) => {
  console.time('video-thumbnail');

  log('Started generating video thumbnail for: \n' + objectPath);
  if (!width || !height) {
    log('Generating with media info');
    return new Promise((resolve, reject) => {
      getVideoDimenssions(objectPath)
        .then(dimensions => {
          log('Got dimensions', dimensions);
          _generateThumbnail(objectPath, dimensions.width, dimensions.height, timeMark, count, outputFilename)
            .then(resolve, reject);
          done();
        }, reject);
    });
  } else {
    return _generateThumbnail(objectPath, width, height, timeMark, count, outputFilename);
  }
};

const getFfmpegCommand = (screenShotTime = 5, objectPath, width, height) => {
  return child_process.spawn('ffmpeg', [
    '-ss', `${screenShotTime}`,
    '-i', objectPath,
    '-vf', `thumbnail,scale=${width}:${height}`,
    '-qscale:v', DEFAULT_QSCALEV,
    '-frames:v', DEFAULT_FRAMES,
    '-f', 'image2', //todo this might be the name of the output image
    '-c:v', 'mjpeg',
    'pipe:1'
  ]);
};

const _generateThumbnail = (objectPath,
                            width,
                            height,
                            timeMark = DEFAULT_TIME_MARK,
                            count = 1,
                            outputFilename = DEFAULT_TEMP_FILENAME) => {
  log('generating video thumbnail\n', {
    objectPath,
    height,
    width,
    timeMark,
    count,
    outputFilename
  });

  return new Promise((resolve, reject) => {
    const tmpScreenShotFile = fs.createWriteStream(outputFilename);

    const ffmpeg = getFfmpegCommand(timeMark, objectPath, width, height);

    ffmpeg.on('error', err => {
      console.error('error generating video thumbnail', err);
      reject(new VideoGenerationError('error generating video thumbnail'));
    });

    ffmpeg.on('close', code => {
      log('ffmpeg closed with code', code);
      tmpScreenShotFile.end();
      if (code !== 0) {
        reject(new VideoGenerationError(`Error generating video thumbnail. Process ended with code ${code}.`))
      } else {
        resolve(fs.createReadStream(outputFilename));
      }
      done();
    });

    tmpScreenShotFile.on('error', err => {
      console.error('Error on screenshot file generation', err);
      reject(new VideoGenerationError(`There was a file error. ${err}`));
      done();
    });

    tmpScreenShotFile.on('end', err => {
      log('temp file end event', err);
      tmpScreenShotFile.end();
    });

    log('Running ffmpeg');

    ffmpeg.stderr.on('data', function (data) {
      console.log('stderr generating screenshot: ' + data.toString());
    });

    ffmpeg.stdout.pipe(tmpScreenShotFile)
      .on('error', err => {
        console.error('Error generating screenshot', err);
        reject(new VideoGenerationError(err));
        done();
      });
  });
};

class VideoGenerationError extends Error {
  constructor(message) {
    super(message);
  }
}

const done = () => {
  console.timeEnd('video-thumbnail');
};

/**
 *
 * @param videoUrl
 * @return {Promise<{width,height}>}
 */
const getVideoDimenssions = (videoUrl) => {
  log('Getting video dimensions');
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(DEFAULT_VIDEO_HEAD_FILENAME);
    let bytesReceived = 0;
    https.get(videoUrl, res => {
      log('Getting head of video');
      res.pipe(file);
      res.on('data', chunk => {
        bytesReceived += chunk.length;
        log('Received video chunk', chunk.length, bytesReceived);
        if (bytesReceived > DEFAULT_VIDEO_CHUNK_SIZE) {
          res.destroy();
          file.close();
          log('Got video head, getting media info');
          _getMediaInfo(DEFAULT_VIDEO_HEAD_FILENAME)
            .then(resolve, reject);
          }
      });
    });
  });
};

const _getMediaInfo = (fileName) => {
  log('Getting media info');
  return new Promise((resolve, reject) => {
    mediaInfo(fileName).then(function(data) {
      log('Got media info', data);
      for (let i in data) {
        for (let x in data[i].video) {
          resolve({
            width: data[i].video[0].width[0],
            height: data[i].video[0].height[0]
          });
          break;
        }
      }
    }).catch(reject);
  });
};
