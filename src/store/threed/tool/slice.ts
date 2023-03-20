// src/features/editorSlice.js
import { createSlice } from '@reduxjs/toolkit';

export type toolState = {
  toolMode: 'move' | 'scale' | 'pose';
};
const initialState: toolState = {
  toolMode: 'move', // デフォルトのツールモード
  // その他の初期状態
};

const toolSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setToolMode: (state, action) => {
      state.toolMode = action.payload;
    },
  },
});

export default toolSlice;
