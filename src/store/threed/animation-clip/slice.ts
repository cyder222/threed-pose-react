import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { AnimationClip } from 'three';
import { v4 as uuid } from 'uuid';

export type FigureComposerAnimationClipState = {
  [figureUUID: string]: { [animationUUID: string]: THREE.Group };
};

export const initialState: FigureComposerAnimationClipState = {};

export const FigureComposerAnimationClipStateSlice = createSlice({
  name: 'FigureComposerAnimationClipStateSlice',
  initialState,
  reducers: {
    addMixamoAnimationClip: (
      state,
      action: PayloadAction<{
        figureUUID: string;
        trackUUID: string;
        mixamoAnimationAsset: THREE.Group;
      }>,
    ) => {
      const { figureUUID, trackUUID, mixamoAnimationAsset } = action.payload;
      if (!state[figureUUID]) {
        state[figureUUID] = {};
      }
      state[figureUUID][trackUUID] = mixamoAnimationAsset;
    },
  },
});
