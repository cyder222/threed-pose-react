import { createFFmpeg } from '@ffmpeg/ffmpeg';
import { WebGLRenderer } from 'three';
import { FigureComposerHandle } from '../../components/threed/figure-composer';

const ffmpeg = createFFmpeg({ log: true });

export const generateVideo = async (frameData: Array<Uint8Array>) => {
  await ffmpeg.load();

  // frameDataから画像データを取得し、ffmpegに入力する
  for (let i = 0; i < frameData.length; i++) {
    ffmpeg.FS('writeFile', `frame${i}.jpg`, frameData[i]);
  }

  // 画像データを動画にエンコードする
  await ffmpeg.run(
    '-r',
    '30',
    '-i',
    'frame%d.jpg',
    '-c:v',
    'libx264',
    '-vf',
    'fps=30',
    'output.mp4',
  );

  // 動画データを取得する
  const data = ffmpeg.FS('readFile', 'output.mp4');

  // Blobデータを作成し、URLを取得する
  const video = new Blob([data.buffer], { type: 'video/mp4' });
  const url = URL.createObjectURL(video);

  return url;
};
