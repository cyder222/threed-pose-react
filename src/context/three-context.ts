// Contextの作成

import { createContext } from 'react';
import { RootState } from 'react-three-fiber';

// 3Dシーンのカメラとシーンを保持するContextを作成
interface ThreeContextType {
  context: RootState | null;
}
export const ThreeContext = createContext<ThreeContextType>({
  context: null,
});
