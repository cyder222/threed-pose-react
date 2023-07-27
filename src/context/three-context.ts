// Contextの作成

import { createContext } from 'react';

// 3Dシーンのカメラとシーンを保持するContextを作成
interface ThreeContextType {
  camera: THREE.Camera | null;
  scene: THREE.Scene | null;
  gl: THREE.WebGLRenderer | null;
}
export const ThreeContext = createContext<ThreeContextType>({
  camera: null,
  scene: null,
  gl: null,
});
