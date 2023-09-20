import { useCallback, useContext, useState } from 'react';
import StableDiffusionApi, {
  ControlNetUnit,
} from '../../../external/sd-api-frontend/src';
import * as offscreenUtil from '../../../external/sd-api-frontend/src/utils/offscreen-canvas-util';
import { ThreeContext } from '../../../context/three-context';
import { Color, WebGLRenderer } from 'three';
import {
  Box,
  Button,
  FormControl,
  Textarea,
  FormLabel,
  Image,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import React from 'react';
import { ControlNetSetting } from './sd-generate/movie-generate';
import { useDispatch, useSelector } from 'react-redux';
import figureComposerSlice from '../../../store/threed/figure-composer/slice';
import {
  ModelRenderStateEnum,
  RenderStateSlice,
} from '../../../store/threed/camera/slice';
import { renderStateSelector } from '../../../store/threed/camera/selector';
import { RootState } from '../../../store/create-store';
import { waitForNextFrame } from '../../../util/util';
import { animationPlaybackSlice } from '../../../store/threed/animation-playback/slice';
import { backgroundRender } from '../../../util/threed/webgl-rederer-util';
import { wait } from '@testing-library/user-event/dist/utils';
import { SceneContext } from '../../../context/scene-context';

export const SdSideMenu = () => {
  const { context } = useContext(ThreeContext);
  const sceneObjectContext = useContext(SceneContext);
  const modelRenderState = useSelector((state: RootState) => {
    return renderStateSelector.getModelRenderState(state);
  });
  const [isRendering, setIsRendering] = useState(false);
  const dispatch = useDispatch();
  const api = new StableDiffusionApi({
    host: '126.94.178.233', //'192.168.3.5', //
    port: 7860,
    protocol: 'http',
  });

  const createScreenShot = useCallback(
    async (updateRenderState: ModelRenderStateEnum) => {
      if (!context) return;
      const { gl, scene, camera, invalidate } = context;
      if (!gl || !camera || !scene) {
        return null;
      }
      if (!sceneObjectContext) return;
      const { figureComposersContext } = sceneObjectContext;
      if (!figureComposersContext) return;
      const { renderer, canvas } = backgroundRender(gl);
      const oldTarget = gl?.domElement;

      const tmpBackground = scene.background?.clone();
      scene.background = new Color(0, 0, 0);

      console.log('[test]dispatched');

      Object.values(figureComposersContext).forEach(handle => {
        handle?.current?.visibleBoneImmediately();
        handle?.current?.hideVRMImmediately();
      });
      renderer?.render(scene, camera);
      const screenshotData = renderer?.domElement.toDataURL();
      scene.background = new Color(0xfefefe);
      Object.values(figureComposersContext).forEach(handle => {
        handle?.current?.hideBoneImmediately();
        handle?.current?.visibleVRMImmediately();
      });

      // backgroundのrendering用に作ったcanvasを解放する
      canvas?.parentNode?.removeChild(canvas);
      renderer?.forceContextLoss();
      return screenshotData;
    },
    [context, context?.gl, modelRenderState],
  );

  const [b64img, setb64Image] = useState<string>('');
  const [b64img2, setb64Image2] = useState<string>('');

  const [controlNetSettings, setControlNetSettings] = useState([0]);

  const addControlNetSetting = () => {
    setControlNetSettings([...controlNetSettings, controlNetSettings.length]);
  };

  let inIsRendering = false;
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      if (isRendering) return;
      inIsRendering = true;
      event.preventDefault();
      console.log('submit');

      const formData = new FormData(event.currentTarget);
      const prompt = formData.get('prompt');
      const negativePrompt = formData.get('negativePrompt');

      const screenshot = await createScreenShot(ModelRenderStateEnum.renderPoseBone);
      if (screenshot) setb64Image2(screenshot);
      const controlNetUnit = screenshot
        ? [
            new ControlNetUnit({
              model: 'control_v11f1p_sd15_depth [cfd03158]', //'control_v11p_sd15_canny [d14c016b]',
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
      inIsRendering = false;
    },
    [context],
  );
  return (
    <Tabs variant='enclosed' isLazy>
      <TabList>
        <Tab>静止画</Tab>
        <Tab>動画</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <form onSubmit={handleSubmit}>
            <FormControl id='prompt' my={4}>
              <FormLabel>ポジティブプロンプト</FormLabel>
              <Textarea name='prompt' rows={5} />
            </FormControl>

            <FormControl id='negativePrompt' my={4}>
              <FormLabel>ネガティブプロンプト</FormLabel>
              <Textarea name='negativePrompt' rows={5} />
            </FormControl>

            <Button type='submit' colorScheme='teal' mt={4}>
              生成
            </Button>

            <Image src={b64img} width='100%' mt={4} />
            <Image src={b64img2} width='100%' mt={4} />
          </form>
        </TabPanel>
        <TabPanel>
          <form
            onSubmit={() => {
              return;
            }}>
            <FormControl id='videoPrompt' my={4}>
              <FormLabel>ポジティブプロンプト</FormLabel>
              <Textarea name='videoPrompt' rows={5} />
            </FormControl>

            <FormControl id='negativeVideoPrompt' my={4}>
              <FormLabel>ネガティブプロンプト</FormLabel>
              <Textarea name='negativeVideoPrompt' rows={5} />
            </FormControl>

            <Tabs variant='soft-rounded' isLazy>
              <TabList>
                {controlNetSettings.map((_, index) => (
                  <Tab key={index}>設定 {index + 1}</Tab>
                ))}
                <Button onClick={addControlNetSetting}>+</Button>
              </TabList>

              <TabPanels>
                {controlNetSettings.map((_, index) => (
                  <TabPanel key={index}>
                    <ControlNetSetting index={index} />
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>

            <Button type='submit' colorScheme='teal' mt={4}>
              生成
            </Button>
          </form>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};
