import { configureStore } from '@reduxjs/toolkit';
import { Store, combineReducers } from 'redux';
import logger from 'redux-logger';
import figureComposerSlice, {
  initialState as initalFigureComposersState,
  undoableFigureComposerReducer,
} from './threed/figure-composer/slice';
import toolStateSlice from './threed/tool/slice';
import {
  toolMachineInitlizer,
  toolService,
} from './threed/tool/machine/object-tool-machine';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { sideMenuSlice } from './ui/left-side-menu/slice';
import { RenderStateSlice } from './threed/camera/slice';
import { figureComposerKeyTracksSlice } from './threed/keytrack/slice';
import { animationApi } from './threed/keytrack/api';
import { FigureComposerAnimationClipStateSlice } from './threed/animation-clip/slice';
import { animationClipApi } from './threed/animation-clip/api';

export const rootReducer = combineReducers({
  figureComposers: undoableFigureComposerReducer,
  currentTool: toolStateSlice.reducer,
  sideMenu: sideMenuSlice.reducer,
  renderState: RenderStateSlice.reducer,
  animation: figureComposerKeyTracksSlice.reducer,
  animationClip: FigureComposerAnimationClipStateSlice.reducer,
  [animationApi.reducerPath]: animationApi.reducer,
  [animationClipApi.reducerPath]: animationClipApi.reducer,
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const defaultPreloadedState = () => {
  return {
    figureComposers: initalFigureComposersState,
  };
};

export type StoreState = ReturnType<typeof defaultPreloadedState>;

export type ReduxStore = Store<StoreState>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleWare => {
    const middleware = getDefaultMiddleWare({
      serializableCheck: false,
    })
      .concat(animationApi.middleware)
      .concat(animationClipApi.middleware);
    if (import.meta.env.MODE !== 'production') {
      middleware.push(logger);
    }
    return middleware;
  },
  devTools: import.meta.env.MODE !== 'production',
});

toolMachineInitlizer(toolService, store);

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export type RootState = ReturnType<typeof store.getState>;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
