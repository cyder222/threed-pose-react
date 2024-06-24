import { RootState } from '../../create-store';

export const FigureComposerAnimationPlaybackSelector = {
  getPlaybackSetting: (state: RootState) => {
    return state.animationPlayback;
  },
};
