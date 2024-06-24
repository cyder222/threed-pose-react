// 動画シーン生成用のContextの作成

import { createContext } from 'react';
import { FigureComposerHandle } from '../components/threed/figure-composer';
import { OpenPoseBonesHandle } from '../components/threed/openPoseBones';

// 3Dシーンで、アニメーション操作に必要な情報を保持するContextを作成
// (動画シーン生成用)
export interface ThreeDirectFigureComposerType {
  figureComposerHandles: { [uuid: string]: FigureComposerHandle };
}
export const ThreeDirectFigureComposerContext =
  createContext<ThreeDirectFigureComposerType>({
    figureComposerHandles: {},
  });
