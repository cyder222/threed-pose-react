import * as THREE from 'three';

export type SerializedVector3 = {
  x: number;
  y: number;
  z: number;
};

// THREE.Vector3をシリアライズ可能なオブジェクトに変換する関数
export const serializeVector3 = (vector: THREE.Vector3): SerializedVector3 => {
  return {
    x: vector.x,
    y: vector.y,
    z: vector.z,
  };
};

// シリアライズ可能なオブジェクトからTHREE.Vector3を再構築する関数
export const deserializeVector3 = (serialized: SerializedVector3): THREE.Vector3 => {
  return new THREE.Vector3(serialized.x, serialized.y, serialized.z);
};

export type SerializedEuler = {
  x: number;
  y: number;
  z: number;
  order: THREE.EulerOrder;
};

// THREE.Eulerをシリアライズ可能なオブジェクトに変換する関数
export const serializeEuler = (euler: THREE.Euler): SerializedEuler => {
  return {
    x: euler.x,
    y: euler.y,
    z: euler.z,
    order: euler.order,
  };
};

// シリアライズ可能なオブジェクトからTHREE.Eulerを再構築する関数
export const deserializeEuler = (serialized: SerializedEuler): THREE.Euler => {
  return new THREE.Euler(serialized.x, serialized.y, serialized.z, serialized.order);
};
