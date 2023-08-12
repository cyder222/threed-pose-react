import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toolSlice from '../../../store/threed/tool/slice';
import { toolSelector } from '../../../store/threed/tool/selectors';
import { RootState } from '../../../store/create-store';
import { useRef } from 'react';
import { Canvas, useFrame, useThree } from 'react-three-fiber';
import { Html, Billboard } from '@react-three/drei';
import { toolService } from '../../../store/threed/tool/machine/object-tool-machine';
import { Box3, Group, Vector3 } from 'three';
import { HStack, Stack } from '@chakra-ui/react';
import figureComposerSlice from '../../../store/threed/figure-composer/slice';
import { FigureComposerListSelector } from '../../../store/threed/figure-composer/selectors';
import { VRM } from '@pixiv/three-vrm';
import { ReactComponent as MoveIcon } from '../../../icons/move.svg';
import { ReactComponent as RotationIcon } from '../../../icons/rotation.svg';
import { ReactComponent as ScaleIcon } from '../../../icons/scale.svg';
import { ReactComponent as CloseIcon } from '../../../icons/close.svg';
import { ReactComponent as PoseIcon } from '../../../icons/pose.svg';
import { Center } from 'chakra-ui';

const PoseToolBox = (props: { position: Vector3; targetUUID: string }) => {
  const dispatch = useDispatch();
  const tool = useSelector((state: RootState) => {
    return toolSelector.getCurrent(state);
  });
  const getControlType = useMemo(() => {
    if (tool.tool.matches({ target_selected: 'move' })) {
      return 'translate';
    } else if (tool.tool.matches({ target_selected: 'rotate' })) {
      return 'rotate';
    } else if (tool.tool.matches({ target_selected: 'scale' })) {
      return 'scale';
    } else if (tool.tool.matches({ target_selected: 'pose' })) {
      return 'pose';
    } else {
      return '';
    }
  }, [tool.tool]);

  return (
    <Billboard position={props.position}>
      <Html
        style={{
          height: '32px',
          width: '160px',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <HStack alignItems={'center'}>
          <Stack w={32} h={32} alignItems={'center'} justifyContent={'center'}>
            <button
              onPointerDown={e => {
                e.stopPropagation();
              }}>
              <PoseIcon width={32} height={32}></PoseIcon>
            </button>
          </Stack>
          <Stack w={32} h={32} alignItems={'center'} justifyContent={'center'}>
            <button
              onPointerDown={e => {
                e.stopPropagation();
                toolService.send('CANCEL');
                dispatch(figureComposerSlice.actions.clearAlBonelSelectState());
              }}>
              <CloseIcon width={24} height={24} />
            </button>
          </Stack>
        </HStack>
      </Html>
    </Billboard>
  );
};

const defaultIconSize = 24;
const selectedIconSize = 32;

const TranslationToolbox = (props: { position: Vector3; targetUUID: string }) => {
  const toolHtmlRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const tool = useSelector((state: RootState) => {
    return toolSelector.getCurrent(state);
  });
  const getControlType = useMemo(() => {
    if (tool.tool.matches({ target_selected: 'move' })) {
      return 'translate';
    } else if (tool.tool.matches({ target_selected: 'rotate' })) {
      return 'rotate';
    } else if (tool.tool.matches({ target_selected: 'scale' })) {
      return 'scale';
    } else if (tool.tool.matches({ target_selected: 'pose' })) {
      return 'pose';
    } else {
      return '';
    }
  }, [tool.tool]);

  return (
    <Billboard position={props.position}>
      <Html
        ref={toolHtmlRef}
        style={{
          height: '32px',
          width: '160px',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <HStack alignItems={'center'}>
          <Stack w={32} h={32} alignItems={'center'} justifyContent={'center'}>
            <button
              onPointerDown={e => {
                e.stopPropagation();
                toolService.send('MOVE');
              }}>
              {getControlType === 'translate' ? (
                <MoveIcon width={32} height={32} />
              ) : (
                <MoveIcon width={24} height={24} />
              )}
            </button>
          </Stack>
          <Stack w={32} h={32} alignItems={'center'} justifyContent={'center'}>
            <button
              onPointerDown={e => {
                e.stopPropagation();
                toolService.send('ROTATE');
              }}>
              {getControlType === 'rotate' ? (
                <RotationIcon width={32} height={32} />
              ) : (
                <RotationIcon width={24} height={24} />
              )}
            </button>
          </Stack>
          <Stack w={32} h={32} alignItems={'center'} justifyContent={'center'}>
            <button
              onPointerDown={e => {
                e.stopPropagation();
                toolService.send('SCALE');
              }}>
              {getControlType === 'scale' ? (
                <ScaleIcon width={32} height={32} />
              ) : (
                <ScaleIcon width={24} height={24} />
              )}
            </button>
          </Stack>
          <Stack w={32} h={32} alignItems={'center'} justifyContent={'center'}>
            <button
              onPointerDown={e => {
                e.stopPropagation();
                toolService.send('POSE');
              }}>
              <PoseIcon width={24} height={24}></PoseIcon>
            </button>
          </Stack>
          <Stack w={32} h={32} alignItems={'center'} justifyContent={'center'}>
            <button
              onPointerDown={e => {
                e.stopPropagation();
                toolService.send('CANCEL');
                dispatch(figureComposerSlice.actions.clearAllSelectState());
              }}>
              <CloseIcon width={24} height={24}></CloseIcon>
            </button>
          </Stack>
        </HStack>
      </Html>
    </Billboard>
  );
};

const ObjectToolBox = (props: { targetUUID: string; target?: Group }) => {
  const dispatch = useDispatch();
  const { camera, size } = useThree();
  const toolState = useSelector((state: RootState) => {
    return toolSelector.getCurrent(state);
  });
  const composerState = useSelector((state: RootState) => {
    return FigureComposerListSelector.getById(state, props.targetUUID);
  });
  const tool = useSelector((state: RootState) => {
    return toolSelector.getCurrent(state);
  });

  const getToolboxType = useMemo(() => {
    if (tool.tool.matches({ target_selected: 'pose' })) {
      return 'poseControlMode';
    } else if (tool.tool.matches('target_selected')) {
      return 'objectControlTool';
    } else {
      return '';
    }
  }, [tool.tool]);

  const ref = useRef(null);
  const [pos, setPos] = useState(new Vector3(0, 1, 0));
  return (
    <>
      {getToolboxType === 'objectControlTool' && (
        <TranslationToolbox
          targetUUID={props.targetUUID}
          position={pos}></TranslationToolbox>
      )}
      {getToolboxType === 'poseControlMode' && (
        <PoseToolBox targetUUID={props.targetUUID} position={pos}></PoseToolBox>
      )}
    </>
  );
};

export default ObjectToolBox;
