import React, { useEffect, useRef, useState } from 'react';
import { OrbitControls } from '@react-three/drei';
import { FigureComposerListSelector } from '../../store/threed/figure-composer/selectors';
import figureComposerSlice from '../../store/threed/figure-composer/slice';
import { RootState } from '../../store/create-store';
import { Canvas } from '@react-three/fiber';
import { useDispatch, useSelector } from 'react-redux';
import FigureComposer from './figure-composer';
import * as THREE from 'three';

const Scene = () => {
  const dispatch = useDispatch();
  const figureComposers = useSelector((state: RootState) => {
    return FigureComposerListSelector.getAll(state);
  });
  const canvas = useRef(null);
  const [camera, setCamera] = useState(
    new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 10000),
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

  return (
    <main style={{ width: '100%', height: '100%' }}>
      <Canvas ref={canvas} camera={camera}>
        <OrbitControls enablePan={true} minDistance={2} maxDistance={100} />
        <ambientLight />
        <pointLight position={[20, 10, 10]} />
        {Object.keys(figureComposers).map(key => {
          return <FigureComposer key={key} uuid={key}></FigureComposer>;
        })}
      </Canvas>
    </main>
  );
};

export default Scene;
