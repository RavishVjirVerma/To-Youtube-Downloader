const path = require('path');
const fs = require('fs');
const ytdl = require('ytdl-core');

const url = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ';
const output = path.resolve(__dirname, 'video.mp4');

const video = ytdl(url);
video.
video.pipe(fs.createWriteStream(output));

video.on('end', () => {
  ytdl(url, { range: { start: 1001 } })
    .pipe(fs.createWriteStream(output, { flags: 'a' }));
});