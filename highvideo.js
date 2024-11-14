import { existsSync, mkdirSync, createWriteStream, unlinkSync } from 'fs';
import ytdl from '@distube/ytdl-core';
const { getInfo, chooseFormat, downloadFromInfo, validateURL } = ytdl;
import chalk from 'chalk';
const { yellow, red, green } = chalk;
import emojiStrip from 'emoji-strip';
import { exec } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import clipboardy from 'clipboardy';
const { writeSync } = clipboardy;


writeSync('')

const removeSpecialCharacters = (str) => {
  return str.replace(/[<>:"/\\|?*]+/g, '');
};

const createDirectoryIfNotExists = (directory) => {
  if (!existsSync(directory)) {
    mkdirSync(directory);
  }
};

const downloadYouTubeVideo = async (url) => {
  try {
    if ( !validateURL(url)){
      console.log("not valid url return ");
      return;
    }
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error fetching URL: ${response.status}`);
      }else{
        console.log("fetch success ")
      }
      // return true;
    } catch (error) {
      console.error(red(`Failed to access URL: ${error.message}`));
      return false;
    }
    createDirectoryIfNotExists('./Downloaded Videos');
    const videoInfo = await getInfo(url);
    const videoTitle = videoInfo.videoDetails.title;
    const sanitizedTitle = removeSpecialCharacters(emojiStrip(videoTitle));
    console.log(yellow(`\nBaixando vídeo: ${videoTitle}`));

    const videoFilePath = `./Downloaded Videos/${sanitizedTitle}_video.webm`;
    const audioFilePath = `./Downloaded Videos/${sanitizedTitle}_audio.m4a`;
    const outputFilePath = `./Downloaded Videos/${sanitizedTitle}.mp4`;

    if (existsSync(outputFilePath)) {
      console.error(red(`\nArquivo "${outputFilePath}" já existe. Pulando.`));
      return;
    }

    console.log(yellow(`Downloading video stream...`));
    const videoFormat = chooseFormat(videoInfo.formats, { quality: 'highestvideo' });
    const videoStream = downloadFromInfo(videoInfo, { format: videoFormat });

    videoStream.on('error', (error) => {
      console.error(red(`Error in video stream: ${error.message}`,error));
    });

    videoStream.pipe(createWriteStream(videoFilePath));

    // await new Promise((resolve) => videoStream.on('end', resolve));
    await new Promise((resolve, reject) => {
      videoStream.on('end', () => {
        console.log(green(`Video stream download completed.`));
        resolve();
      });
      videoStream.on('error', reject);
    });

    const audioFormat = chooseFormat(videoInfo.formats, { quality: 'highestaudio' });
    const audioStream = downloadFromInfo(videoInfo, { format: audioFormat });
    audioStream.pipe(createWriteStream(audioFilePath));
    await new Promise((resolve) => audioStream.on('end', resolve));

    const mergeCommand = `"${ffmpeg}" -i "${videoFilePath}" -i "${audioFilePath}" -c:v copy -c:a aac "${outputFilePath}"`;
    exec(mergeCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(red(`Erro ao mesclar: ${error}`));
      } else {
        console.log(green(`\nVídeo baixado: ${videoTitle}`));
        unlinkSync(videoFilePath);
        unlinkSync(audioFilePath);
      }
    });
  } catch (error) {
    console.error(red(`Erro ao processar o vídeo: ${error}`));
  }
};

const DownloadVideo = async () => {
  createDirectoryIfNotExists('./Downloaded Videos');
  let lastURL = '';

  setInterval(async () => {
    const currentClipboard = "https://www.youtube.com/watch?v=d2ofxg8pHfQ";
    if ( validateURL(currentClipboard)) {
      lastURL = currentClipboard;
      await downloadYouTubeVideo(currentClipboard);
    }
  }, 1000);
};
// downloadYouTubeVideo("https://www.youtube.com/watch?v=ttmvBBYqe-M");
downloadYouTubeVideo("https://www.youtube.com/watch?v=2HiObtJLNFY&list=PLYM3Ts4LE-bAlxc_8B7Yi3-UN41WUYB9Y&index=1");
// DownloadVideo();

