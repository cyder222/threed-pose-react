import { extend, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import React, { useRef } from 'react';

extend({ OrbitControls });

export function RealtimeUpdateOrbitControls() {
  const orbitRef = useRef(null);
  const { camera, gl } = useThree();

  return <OrbitControls args={[camera, gl.domElement]} ref={orbitRef} />;
}
