import { Box, Button, VStack, Tooltip } from '@chakra-ui/react';
import { useDispatch } from 'react-redux';
import { ReactComponent as AddIcon } from '../../../icons/add_human.svg';
import { ReactComponent as AnimationModeIcon } from '../../../icons/animation_body.svg';
import { ReactComponent as CameraSetting } from '../../../icons/camera_setting.svg';
import { ReactComponent as MakeIcon } from '../../../icons/toaster.svg';
import { sideMenuSlice } from '../../../store/ui/left-side-menu/slice';

const DefaultSceneToolBox = () => {
  const dispatch = useDispatch();
  return (
    <VStack alignItems={'center'} spacing={0}>
      <Tooltip label='VRMを追加' placement='right'>
        <Box
          bg={'transparent'}
          p={0}
          height={'32px'}
          _hover={{ transform: 'scale(1.33)', bg: 'transparent' }}
          onClick={() => {
            return;
          }}>
          <AddIcon width={24} height={24} />
        </Box>
      </Tooltip>
      <Tooltip label='カメラ設定' placement='right'>
        <Box
          as={Button}
          bg={'transparent'}
          p={0}
          height={'32px'}
          _hover={{ transform: 'scale(1.33)', bg: 'transparent' }}
          onClick={() => {
            dispatch(
              sideMenuSlice.actions.changeDisplayType({
                displayType: 'cameraSettingPanel',
              }),
            );
          }}>
          <CameraSetting width={24} height={24} />
        </Box>
      </Tooltip>
      <Tooltip label='画像生成' placement='right'>
        <Box
          as={Button}
          p={0}
          height={'32px'}
          bg={'transparent'}
          _hover={{ transform: 'scale(1.33)', bg: 'transparent' }}
          onClick={() => {
            dispatch(
              sideMenuSlice.actions.changeDisplayType({
                displayType: 'generationPanel',
              }),
            );
          }}>
          <MakeIcon width={24} height={24} />
        </Box>
      </Tooltip>
      <Tooltip label='アニメーションモードに切り替え' placement='right'>
        <Box
          as={Button}
          p={0}
          height={'32px'}
          bg={'transparent'}
          _hover={{ transform: 'scale(1.33)', bg: 'transparent' }}>
          <AnimationModeIcon width={24} height={24} />
        </Box>
      </Tooltip>
    </VStack>
  );
};

export const LeftToolBar = () => {
  return (
    <Box
      position='absolute'
      top='50%'
      left={'16px'}
      transform='translateY(-50%)'
      zIndex={12}
      bg='rgba(0, 0, 0, 0)'>
      <DefaultSceneToolBox></DefaultSceneToolBox>
    </Box>
  );
};
