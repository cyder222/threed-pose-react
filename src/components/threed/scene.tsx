import React, { useEffect, useMemo, useRef, useState } from 'react';
import { OrbitControls, TransformControls } from '@react-three/drei';
import { FigureComposerListSelector } from '../../store/threed/figure-composer/selectors';
import figureComposerSlice from '../../store/threed/figure-composer/slice';
import { RootState } from '../../store/create-store';
import { Canvas } from '@react-three/fiber';
import { useDispatch, useSelector } from 'react-redux';
import FigureComposer from './figure-composer';
import * as THREE from 'three';
import { toolSelector } from '../../store/threed/tool/selectors';
import { EmptyObject } from './empty-object';

import Toolbox from './ui/tool-box';
import useSceneEditTool from '../../hooks/tools/use-scene-edit-tool';
import { VRM } from '@pixiv/three-vrm';
import { Group } from 'three';
import { SdSideMenu } from '../ui/sidebar/sd-generate';

interface VrmRefs {
  [key: string]: React.RefObject<VRM>;
}

const Scene = () => {
  const dispatch = useDispatch();
  const figureComposers = useSelector((state: RootState) => {
    return FigureComposerListSelector.getAll(state);
  });
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
    } else {
      return '';
    }
  }, [tool.tool]);

  const sceneEditTool = useSceneEditTool();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vrmRefs = useRef<VrmRefs>({});
  const [orbitEnable, setOrbitEnable] = useState(true);
  const canvas = useRef(null);
  const [camera, setCamera] = useState(
    new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 10000),
  );

  const figureComposerRefs = useRef<Map<string, React.RefObject<HTMLDivElement>>>(
    new Map<string, React.RefObject<HTMLDivElement>>([]),
  );

  useEffect(() => {
    dispatch(
      figureComposerSlice.actions.addNewComposer({ filename: 'vrms/DesignDoll.vrm' }),
    );
    camera.position.set(0, 10, -2);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    setCamera(camera);
  }, []);

  useEffect(() => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }, [innerHeight, innerWidth]);

  useEffect(() => {
    if (tool.tool.context.isProcessing) {
      setOrbitEnable(false);
    } else {
      setOrbitEnable(true);
    }
  }, [tool.tool.context.isProcessing]);

  return (
    <main
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row' }}>
      <div style={{ width: '30%', borderRight: '1px solid' }}>
        <SdSideMenu></SdSideMenu>
      </div>
      <Canvas ref={canvas} camera={camera}>
        <OrbitControls
          enablePan={true}
          minDistance={2}
          maxDistance={100}
          enabled={orbitEnable}
          camera={camera}></OrbitControls>
        <ambientLight />
        <EmptyObject
          onClick={e => {
            return sceneEditTool?.emptyHandlers?.onMouseDown?.(e);
          }}
          onPointerUp={e => {
            return sceneEditTool?.emptyHandlers?.onMouseUp?.(e);
          }}></EmptyObject>
        <pointLight position={[20, 10, 10]} />
        {Object.keys(figureComposers).map(key => {
          vrmRefs.current[key] = React.createRef<VRM>();
          return (
            <group>
              <Toolbox
                target={vrmRefs.current[key].current?.scene}
                targetUUID={key}></Toolbox>
              <FigureComposer
                vrmRef={vrmRefs.current[key]}
                key={key}
                uuid={key}></FigureComposer>
            </group>
          );
        })}
      </Canvas>
    </main>
  );
};

export default Scene;
