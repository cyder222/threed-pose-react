import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toolSlice from '../../../store/threed/tool/slice';
import { toolSelector } from '../../../store/threed/tool/selectors';
import { RootState } from '../../../store/create-store';
import { useRef } from 'react';
import { Canvas, useFrame } from 'react-three-fiber';
import { Html, Billboard } from '@react-three/drei';
import { toolService } from '../../../store/threed/tool/machine/object-tool-machine';
import { Group, Vector3 } from 'three';
import { HStack } from '@chakra-ui/react';
import figureComposerSlice from '../../../store/threed/figure-composer/slice';
import { FigureComposerListSelector } from '../../../store/threed/figure-composer/selectors';

interface ToolBoxRefs {
  billBoardRef: React.RefObject<typeof Billboard>;
}

const TranslationToolbox = (
  props: { position: Vector3; targetUUID: string } & ToolBoxRefs,
) => {
  const billBoardRef = useRef(null);
  const dispatch = useDispatch();
  return (
    <Billboard ref={billBoardRef} position={props.position}>
      <Html>
        <HStack>
          <div>
            <button
              onPointerDown={e => {
                e.stopPropagation();
                toolService.send('MOVE');
              }}>
              移動
            </button>
          </div>
          <div>
            <button
              onPointerDown={e => {
                e.stopPropagation();
                toolService.send('ROTATE');
              }}>
              回転
            </button>
          </div>
          <div>
            <button
              onPointerDown={e => {
                e.stopPropagation();
                toolService.send('SCALE');
              }}>
              スケール
            </button>
          </div>
          <div>
            <button
              onPointerDown={e => {
                e.stopPropagation();
                toolService.send('CANCEL');
                dispatch(figureComposerSlice.actions.clearAllSelectState());
              }}>
              キャンセル
            </button>
          </div>
        </HStack>
      </Html>
    </Billboard>
  );
};

const ObjectToolBox = (props: {
  targetUUID: string;
  targetBoudingBOX: THREE.Object3D;
}) => {
  const dispatch = useDispatch();
  const toolState = useSelector((state: RootState) => {
    return toolSelector.getCurrent(state);
  });
  const composerState = useSelector((state: RootState) => {
    return FigureComposerListSelector.getById(state, props.targetUUID);
  });

  // オブジェクトの位置とサイズに合わせて表示位置を調整する
  useEffect(() => {
    //表示位置を調整する
  }, [
    composerState.vrmState.rotation.x,
    composerState.vrmState.rotation.y,
    composerState.vrmState.rotation.z,
    composerState.vrmState.translate.x,
    composerState.vrmState.translate.y,
    composerState.vrmState.translate.z,
    composerState.vrmState.scale.x,
    composerState.vrmState.scale.y,
    composerState.vrmState.scale.z,
  ]);

  const ref = useRef(null);

  return (
    <>
      <TranslationToolbox
        billBoardRef={ref}
        targetUUID={props.targetUUID}
        position={new Vector3(0, 2, 0)}></TranslationToolbox>
      {/* 他のツールボタン */}
    </>
  );
};

export default ObjectToolBox;
