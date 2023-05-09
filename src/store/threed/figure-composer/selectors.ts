import { RootState } from '../../create-store';
import { ComposerSelectState, FigureComposerEntity, FigureComposersState } from './slice';

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
  getSelected: (state: RootState): { [k: string]: FigureComposerEntity } => {
    return Object.fromEntries(
      Object.entries(state.figureComposers).filter(entry => {
        return entry[1].composerSelectState === ComposerSelectState.selected;
      }),
    );
  },
};
