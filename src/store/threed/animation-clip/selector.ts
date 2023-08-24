import { RootState } from '../../create-store';

export const FigureComposerAnimationClipSelector = {
  getAnimationClips: (state: RootState, targetUUID: string) => {
    return state.animationClip[targetUUID];
  },
  getAnimationClip: (state: RootState, targetUUID: string, trackUUID: string) => {
    return state.animationClip?.[targetUUID]?.[trackUUID] || null;
  },
};
