// sideMenuSlice.js
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type displayTypes = 'generationPanel' | 'infomationPanel' | 'cameraSettingPanel';

export type sideMenuState = {
  isOpen: boolean;
  displayType: displayTypes;
};

const initialState: sideMenuState = {
  isOpen: false,
  displayType: 'generationPanel',
};

export const sideMenuSlice = createSlice({
  name: 'sideMenu',
  initialState,
  reducers: {
    toggleMenu: state => {
      state.isOpen = !state.isOpen;
    },
    changeDisplayType: (state, action: PayloadAction<{ displayType: displayTypes }>) => {
      state.displayType = action.payload.displayType;
    },
  },
});

export default sideMenuSlice;
