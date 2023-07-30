import { configureStore } from '@reduxjs/toolkit';
import { Store, combineReducers } from 'redux';
import logger from 'redux-logger';
import figureComposerSlice, {
  initialState as initalFigureComposersState,
} from './threed/figure-composer/slice';
import toolStateSlice from './threed/tool/slice';
import {
  toolMachineInitlizer,
  toolService,
} from './threed/tool/machine/object-tool-machine';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const rootReducer = combineReducers({
  figureComposers: figureComposerSlice.reducer,
  currentTool: toolStateSlice.reducer,
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
    });
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
