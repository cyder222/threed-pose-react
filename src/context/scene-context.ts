// Contextの作成

import { createContext } from 'react';
import { RootState } from 'react-three-fiber';
import { FigureComposerHandle } from '../components/threed/figure-composer';

interface FigureComposersContext {
  [key: string]: React.RefObject<FigureComposerHandle> | null;
}
// アプリケーション依存のコンテキスト
interface SceneContext {
  figureComposersContext: FigureComposersContext | null;
}
export const SceneContext = createContext<SceneContext>({ figureComposersContext: null });
