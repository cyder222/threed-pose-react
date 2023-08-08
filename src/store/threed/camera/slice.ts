// sideMenuSlice.js
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum ModelRenderStateEnum {
  renderVRM = 1,
  renderPoseBone = 1 << 1,
  renderDepth = 1 << 2,
  renderOutline = 1 << 3,
}
export type renderState = {
  modelRenderState: number;
};

const initialState: renderState = {
  modelRenderState: ModelRenderStateEnum.renderVRM,
};

export const RenderStateSlice = createSlice({
  name: 'sideMenu',
  initialState,
  reducers: {
    changeModelRenderState: (state, action: PayloadAction<{ renderState: number }>) => {
      state.modelRenderState = action.payload.renderState;
    },
  },
});

export default RenderStateSlice.reducer;
