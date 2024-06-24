import React, { createContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  OrbitControls,
  Html,
  TransformControls,
  CameraControls,
} from '@react-three/drei';
import { Box } from '@chakra-ui/react';
import { FigureComposerListSelector } from '../../store/threed/figure-composer/selectors';
import figureComposerSlice from '../../store/threed/figure-composer/slice';
import { RootState } from '../../store/create-store';
import { Canvas } from '@react-three/fiber';
import { Provider, useDispatch, useSelector } from 'react-redux';
import FigureComposer, { FigureComposerHandle } from './figure-composer';
import * as THREE from 'three';
import { toolSelector } from '../../store/threed/tool/selectors';
import { EmptyObject } from './empty-object';
import SimpleCameraControll from './control/simple-camera-controll';
import { RootState as ThreeRootState } from 'react-three-fiber';
import Toolbox from './ui/tool-box';
import useSceneEditTool from '../../hooks/tools/use-scene-edit-tool';
import { VRM } from '@pixiv/three-vrm';
import { Group } from 'three';
import { SdSideMenu } from '../ui/sidebar/sd-generate';
import { useFrame, useThree } from 'react-three-fiber';
import { ThreeContext } from '../../context/three-context';
import { VStack } from '@chakra-ui/react';
import { LeftToolBar } from '../ui/screen-tool/left-toolbar';
import { useSidemenuComponent } from '../../hooks/ui/use-sidemenu';
import { SceneContext } from '../../context/scene-context';

interface VrmRefs {
  [key: string]: React.RefObject<VRM>;
}

interface FigureComposerRefs {
  [key: string]: React.RefObject<FigureComposerHandle>;
}

const Scene = () => {
  const dispatch = useDispatch();
  const bodyRef = useRef<HTMLDivElement>(null);
  const orbit = useRef<any>();
  useEffect(() => {
    if (!orbit.current) return;
    orbit.current.tick = orbit.current.update();
  }, [orbit.current]);

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
  const vrmRefs = useRef<VrmRefs>({});
  const figureComposerRefs = useRef<FigureComposerRefs>({});
  const [orbitEnable, setOrbitEnable] = useState(true);
  const canvas = useRef(null);
  const [camera, setCamera] = useState(
    new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.3, 20),
  );
  const [threeContext, setThreeContext] = useState<ThreeRootState | null>(null);

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

  const sideMenu = useSidemenuComponent();

  return (
    <main
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row' }}>
      <div style={{ width: '250px', borderRight: '1px solid' }}>
        <ThreeContext.Provider value={{ context: threeContext }}>
          <SceneContext.Provider
            value={{ figureComposersContext: figureComposerRefs.current }}>
            {sideMenu({})}
          </SceneContext.Provider>
        </ThreeContext.Provider>
      </div>
      <div className='screen' style={{ position: 'relative', width: '100%' }}>
        <LeftToolBar></LeftToolBar>
        <Canvas
          ref={canvas}
          camera={camera}
          onCreated={state => {
            // 生成時に、外に渡す用のgl, camera, sceneをセットする
            setThreeContext(state);
          }}>
          <CameraControls
            enabled={orbitEnable}
            camera={camera}
            smoothTime={0}
            draggingSmoothTime={0}
            dampingFactor={0}
            draggingDampingFactor={0}></CameraControls>
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
            figureComposerRefs.current[key] = React.createRef<FigureComposerHandle>();
            return (
              <group>
                <Toolbox
                  target={vrmRefs.current[key].current || undefined}
                  targetUUID={key}></Toolbox>
                <FigureComposer
                  ref={figureComposerRefs.current[key]}
                  vrmRef={vrmRefs.current[key]}
                  key={key}
                  uuid={key}></FigureComposer>
              </group>
            );
          })}
        </Canvas>
      </div>
    </main>
  );
};

export default Scene;
