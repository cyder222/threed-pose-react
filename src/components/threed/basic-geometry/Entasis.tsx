import { useEffect, useRef, useState } from 'react';
import THREE, { BufferAttribute, BufferGeometry, Vector3 } from 'three';
import CylinderBufferGeometry from './CylinderBufferGeometry';

export const Entasis = (props: {
  height: number;
  radiusTop: number;
  radiusBottom: number;
  openEnded: boolean;
  material: THREE.MeshStandardMaterial;
}) => {
  const mesh = useRef<THREE.Mesh>(null!);

  const radialSegments = 32;
  const heightSegments = 64;
  const radiusTop = props.radiusTop;
  const radiusBottom = props.radiusBottom;
  const height = props.height;
  const openEnded = props.openEnded;
  const thetaStart = 0;
  const thetaLength = Math.PI * 2;

  const geometry = new CylinderBufferGeometry(
    radiusTop,
    radiusBottom,
    height,
    radialSegments,
    heightSegments,
    openEnded,
    thetaStart,
    thetaLength,
  );
  const materialRef = useRef<THREE.MeshStandardMaterial>(props.material);

  useEffect(() => {
    mesh.current.material = props.material;
  }, [mesh.current]);

  // Apply entasis effect by scaling individual segments
  const position = geometry.attributes.position as BufferAttribute;
  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i);
    const scale = 1 + 1 * Math.cos((Math.PI * y) / height);
    position.setX(i, position.getX(i) * scale);
    position.setZ(i, position.getZ(i) * scale);
  }

  return <mesh ref={mesh} geometry={geometry}></mesh>;
};
