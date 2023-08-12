import { Matrix4, Vector3, Euler, Quaternion } from 'three';

export function isFlagSet(renderState: number, flag: number): boolean {
  return (renderState & flag) > 0;
}

export const extractTransform = (matrixArray: number[]) => {
  const matrix = new Matrix4();
  matrix.fromArray(matrixArray);

  const position = new Vector3();
  const quaternion = new Quaternion();
  const scale = new Vector3();

  matrix.decompose(position, quaternion, scale);
  const euler = new Euler().setFromQuaternion(quaternion, 'XYZ');
  return {
    position,
    rotation: euler,
    scale,
  };
};

export const composeTransform = (position: Vector3, rotation: Euler, scale: Vector3) => {
  const matrix = new Matrix4();
  matrix.compose(position, new Quaternion().setFromEuler(rotation), scale);
  return matrix.toArray();
};
