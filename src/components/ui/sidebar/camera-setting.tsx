import { Box, VStack, Heading, Radio, RadioGroup, Slider, Text } from '@chakra-ui/react';
import React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/create-store';
import { renderStateSelector } from '../../../store/threed/camera/selector';
import {
  ModelRenderStateEnum,
  RenderStateSlice,
} from '../../../store/threed/camera/slice';

export const CameraSetting = () => {
  const modelRenderState = useSelector((state: RootState) => {
    return renderStateSelector.getModelRenderState(state);
  });

  const [mode, setMode] = useState<number>(modelRenderState);
  const [angle, setAngle] = useState(75);
  const [near, setNear] = useState(0.1);
  const [far, setFar] = useState(1000);
  const dispatch = useDispatch();

  useEffect(() => {}, []);

  useEffect(() => {
    const modeFlag = mode;
    dispatch(
      RenderStateSlice.actions.changeModelRenderState({
        renderState: modeFlag as number,
      }),
    );
  }, [mode]);

  return (
    <Box w='100%' h='100%' p='5' borderRight='1px' borderColor='gray.200'>
      <VStack align='start' spacing={10}>
        <VStack align='start' spacing={5}>
          <Heading size='md'>Display Mode</Heading>
          <RadioGroup onChange={value => setMode(Number(value))} value={`${mode}`}>
            <Radio value={`${ModelRenderStateEnum.renderVRM}`}>Normal Mode</Radio>
            <Radio value={`${ModelRenderStateEnum.renderPoseBone}`}>OpenPose Mode</Radio>
            <Radio
              value={`${
                ModelRenderStateEnum.renderVRM + ModelRenderStateEnum.renderDepth
              }`}>
              Depth Mode
            </Radio>
            <Radio
              value={`${
                ModelRenderStateEnum.renderVRM + ModelRenderStateEnum.renderOutline
              }`}>
              Outline Mode
            </Radio>
          </RadioGroup>
        </VStack>

        <VStack align='start' spacing={5}>
          <Heading size='md'>Camera Parameters</Heading>

          <Box w='100%'>
            <Text mb={1}>Perspective Angle: {angle}</Text>
            <Slider min={0} max={180} value={angle} onChange={setAngle} />
          </Box>

          <Box w='100%'>
            <Text mb={1}>Near: {near}</Text>
            <Slider min={0.1} max={10} step={0.1} value={near} onChange={setNear} />
          </Box>

          <Box w='100%'>
            <Text mb={1}>Far: {far}</Text>
            <Slider min={100} max={2000} step={10} value={far} onChange={setFar} />
          </Box>
        </VStack>
      </VStack>
    </Box>
  );
};

export default CameraSetting;
