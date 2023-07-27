import { useCallback, useContext, useState } from 'react';
import StableDiffusionApi, {
  ControlNetUnit,
} from '../../../external/sd-api-frontend/src';
import * as offscreenUtil from '../../../external/sd-api-frontend/src/utils/offscreen-canvas-util';
import { ThreeContext } from '../../../context/three-context';
import { Color } from 'three';

export const SdSideMenu = () => {
  const { gl, camera, scene } = useContext(ThreeContext);
  const api = new StableDiffusionApi({
    host: '126.94.178.233', //'192.168.3.5', //
    port: 7860,
    protocol: 'http',
  });

  const createScreenShot = useCallback(() => {
    if (!gl || !camera || !scene) {
      if (!camera) console.log('cないよ');
      if (!gl) console.log('glないよ');
      if (!scene) console.log('sceneないよ');
      return null;
    }
    const tmpBackground = scene.background?.clone();
    scene.background = new Color(0, 0, 0);
    gl.render(scene, camera);
    const screenshotData = gl.domElement.toDataURL();
    scene.background = new Color(0xfefefe);
    gl.render(scene, camera);
    return screenshotData;
  }, [gl, camera, scene, ThreeContext]);

  const [b64img, setb64Image] = useState<string>('');
  const [b64img2, setb64Image2] = useState<string>('');

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      console.log('submit');

      const formData = new FormData(event.currentTarget);
      const prompt = formData.get('prompt');
      const negativePrompt = formData.get('negativePrompt');

      const screenshot = createScreenShot();
      const controlNetUnit = screenshot
        ? [
            new ControlNetUnit({
              model: 'control_v11p_sd15_openpose [cab727d4]',
              module: 'none',
              input_image: await offscreenUtil.offscreenCanvasFromBase64(
                screenshot,
                true,
              ),
              processor_res: 512,
            }),
          ]
        : null;
      console.log(controlNetUnit);
      if (typeof prompt === 'string' && typeof negativePrompt === 'string') {
        const res = await api.txt2img({
          prompt: prompt,
          negative_prompt: negativePrompt,
          controlnet_units: controlNetUnit || undefined,
          use_deprecated_controlnet: true,
          width: 512,
          height: 768,
          seed: -1,
        });

        const imageBase64 = await offscreenUtil.toBase64(res.image);
        setb64Image(imageBase64);
        if (screenshot) setb64Image2(screenshot);
      }
    },
    [gl, scene, camera],
  );
  return (
    <form action='#' onSubmit={handleSubmit}>
      <p>ポジティブプロンプト</p>
      <textarea
        name='prompt'
        rows={5}
        style={{
          width: '100%',
          border: '1px solid',
          borderRadius: '5px',
        }}></textarea>
      <p>ネガティブプロンプト</p>
      <textarea
        name='negativePrompt'
        rows={5}
        style={{
          width: '100%',
          border: '1px solid',
          borderRadius: '5px',
        }}></textarea>
      <input type='submit' value='生成'></input>
      <img src={b64img} style={{ width: '100%' }}></img>
      <img src={b64img2} style={{ width: '100%' }}></img>
    </form>
  );
};
