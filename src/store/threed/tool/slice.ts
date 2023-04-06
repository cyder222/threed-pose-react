import { createSlice } from '@reduxjs/toolkit';

export type toolState = {
  toolMode: 'move' | 'scale' | 'pose';
  generalToolMode: 'none' | 'dragging';
  moveToolMode: 'selectTarget' | 'selectedTarget' | 'movingTarget';
  scaleToolMode: 'selectTarget' | 'selectedTarget' | 'scalingTarget';
  poseToolMode: 'selectTarget' | 'selectedTarget' | 'selectedBone' | 'movingBone';
};
const initialState: toolState = {
  toolMode: 'move', // デフォルトのツールモード
  generalToolMode: 'none',
  moveToolMode: 'selectTarget',
  scaleToolMode: 'selectTarget',
  poseToolMode: 'selectTarget',
  // その他の初期状態
};

const toolSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setToolMode: (state, action) => {
      state.toolMode = action.payload;
    },
    setMoveToolMode: (state, action) => {
      state.moveToolMode = action.payload;
      state.generalToolMode = state.moveToolMode === 'movingTarget' ? 'dragging' : 'none';
    },
    setScaleToolMode: (state, action) => {
      state.scaleToolMode = action.payload;
      state.generalToolMode =
        state.scaleToolMode === 'scalingTarget' ? 'dragging' : 'none';
    },
    setPoseToolMode: (state, action) => {
      state.poseToolMode = action.payload;
      state.generalToolMode = state.poseToolMode === 'movingBone' ? 'dragging' : 'none';
    },
  },
});

export default toolSlice;
