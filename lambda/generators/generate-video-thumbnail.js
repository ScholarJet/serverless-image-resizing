import * as child_process from 'child_process';
import * as fs from 'fs';
const DEFAULT_TIME_MARK = 5;

const DEFAULT_QSCALEV = '2';
const DEFAULT_FRAMES = '1';

const generate = (object, width, height, timeMark = DEFAULT_TIME_MARK, count = 1) => {
    return new Promise((resolve, reject) => {
        const s3ObjectUrl = ''; // Todo get object
        const tmpScreenShot = fs.createWriteStream('/tmp/screenshot.jpg');

        const ffmpeg = getFfmpegCommand(timeMark, s3ObjectUrl, width, height);
        ffmpeg.on('error', err => {
            console.error('error generating video thumbnail', err);
            reject(new VideoGenerationError('error generating video thumbnail'));
        });

        ffmpeg.on('close', code => {
           if (code !== 0) {
               reject(new VideoGenerationError(`Error generating video thumbnail. Process ended with code ${code}.`))
           } else {
               tmp
           }
        });
    });
};

const getFfmpegCommand = (screenShotTime = 5, s3ObjectUrl, width, height) => {
  return child_process.spawn('ffmpeg', [
      '-ss', `${screenShotTime}`,
      '-i', s3ObjectUrl,
      '-vf', `thumbnail,scale=${width}:${height}`,
      '-qscale:v', DEFAULT_QSCALEV,
      '-frames:v', DEFAULT_FRAMES,
      '-f', 'image2', //todo this might be the name of the output image
      '-c:v', 'mjpeg',
      'pipe:1'
  ]);
};

export class VideoGenerationError extends Error {
    constructor(message) {
        super(message);
    }}
