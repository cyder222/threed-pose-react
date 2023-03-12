import { RootState } from '../../create-store';
import { FigureComposerEntity, FigureComposersState } from './slice';

export const FigureComposerListSelector = {
  getAll: (state: RootState): FigureComposersState => {
    return state.figureComposers;
  },
  getById: (state: RootState, uuid: string): FigureComposerEntity => {
    return state.figureComposers[uuid];
  },
  getFileUrlById: (state: RootState, uuid: string): string | undefined => {
    return state.figureComposers[uuid].vrmFilename;
  },
};
