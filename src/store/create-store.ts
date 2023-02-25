import { EnhancedStore, ThunkAction, configureStore } from '@reduxjs/toolkit';
import { Action, Store, combineReducers } from 'redux';
import roomSlice, { initialState as RoomState } from './db/room/slice';
import userSlice, { initialState as UserState } from './db/user/slice';
import logger from 'redux-logger';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const rootReducer = combineReducers({
  user: userSlice.reducer,
  room: roomSlice.reducer,
  roomPagePeer: roomPagePeerSlice.reducer,
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const defaultPreloadedState = () => {
  return { user: UserState, room: RoomState, roomPagePeer: roomPagePeerState };
};

export type StoreState = ReturnType<typeof defaultPreloadedState>;

export type ReduxStore = Store<StoreState>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleWare => {
    const middleware = getDefaultMiddleWare({ serializableCheck: false });
    if (process.env.DEV_MODE !== 'production') {
      middleware.push(logger);
    }
    return middleware;
  },
  devTools: process.env.DEV_MODE !== 'production',
});

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export type RootState = ReturnType<typeof store.getState>;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
