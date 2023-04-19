import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toolSlice from '../../../store/threed/tool/slice';
import { toolSelector } from '../../../store/threed/tool/selectors';
import { RootState } from '../../../store/create-store';
import { useRef } from 'react';
import { Canvas, useFrame } from 'react-three-fiber';
import { Html, Billboard } from '@react-three/drei';
import { Group, Vector3 } from 'three';

const Button = (props: { position: Vector3 }) => {
  const buttonRef = useRef<Group>();
  return (
    <group position={props.position}>
      <Billboard>
        <Html>
          <button>Click me</button>
        </Html>
      </Billboard>
    </group>
  );
};

const Toolbox = () => {
  const dispatch = useDispatch();
  const toolState = useSelector((state: RootState) => {
    return toolSelector.getCurrent(state);
  });

  return (
    <>
      <Button position={new Vector3(0, 2, 0)}></Button>
      <Button position={new Vector3(0, 0, 0)}></Button>
      {/* 他のツールボタン */}
    </>
  );
};

export default Toolbox;
