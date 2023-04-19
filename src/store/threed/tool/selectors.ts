import { StateValueMap } from 'xstate';
import { RootState } from '../../create-store';
import { ToolState } from './slice';

export const toolSelector = {
  getCurrent: (state: RootState): ToolState => {
    return state.currentTool;
  },
  getCurrentMode: (state: RootState): string => {
    if (typeof state.currentTool.tool.value === typeof 'string') {
      console.log(state.currentTool.tool.value);
      return state.currentTool.tool.value as string;
    }

    const toolStateMap = state.currentTool.tool.value as StateValueMap;
    console.log(toolStateMap);

    return Object.keys(toolStateMap)[0];
  },
};
