// Used to run commands
const child_process = require('child_process');
// Wrapper to get video info using mediainfo
const mediainfo = require('mediainfo-wrapper');

const fs = require('fs');
const DEFAULT_TIME_MARK = 5;

const DEFAULT_QSCALEV = '2';
const DEFAULT_FRAMES = '1';

const DEFAULT_TEMP_FILENAME = '/tmp/vid-screenshot.jpg';

const DEBUG = true;

const log = DEBUG ? console.log.bind(console) : () => {};

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
      mediainfo(objectPath)
        .then(data => {
          const metadata = {};

          for (let i in data) {

            for (let x in data[i].video) {
              metadata.Width = data[i].video[0].width[0]; //Width in pixels
              metadata.Height = data[i].video[0].height[0]; //Height in pixels
              break;
            }
          }

          _generateThumbnail(objectPath, metadata.width, metadata.height, timeMark, count, outputFilename)
            .then(resolve, reject);
        }, reject)
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
        resolve({
          code,
          readStream: fs.createReadStream(outputFilename)
        });
      }
      done();
    });

    tmpScreenShotFile.on('error', err => {
      reject(new VideoGenerationError(`There was a file error. ${err}`));
      done();
    });

    tmpScreenShotFile.on('end', err => {
      log('temp file end event', err);
      tmpScreenShotFile.end();
    });

    log('Running ffmpeg');
    ffmpeg.stdout.pipe(tmpScreenShotFile)
      .on('error', err => {
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