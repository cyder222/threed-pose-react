import { RootState } from '../../create-store';
import { toolState } from './slice';

export const toolSelector = {
  getCurrent: (state: RootState): toolState => {
    return state.currentTool;
  },
};
