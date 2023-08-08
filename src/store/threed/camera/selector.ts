import { RootState } from '../../create-store';
import { RenderStateSlice } from './slice';

export const renderStateSelector = {
  getModelRenderState: (state: RootState): number => {
    return state.renderState.modelRenderState;
  },
};
