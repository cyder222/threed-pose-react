import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ToolEvent,
  ToolContext,
  toolService,
  ToolStateSchema,
} from './machine/object-tool-machine';
import {
  BaseActionObject,
  ResolveTypegenMeta,
  ServiceMap,
  State,
  TypegenDisabled,
} from 'xstate';

export interface ToolState {
  tool: State<
    ToolContext,
    ToolEvent,
    ToolStateSchema,
    any,
    ResolveTypegenMeta<TypegenDisabled, ToolEvent, BaseActionObject, ServiceMap>
  >;
}

const initialState: ToolState = {
  tool: toolService.machine.initialState,
};

const toolSlice = createSlice({
  name: 'tool',
  initialState,
  reducers: {
    syncXstate: (
      state,
      action: PayloadAction<
        State<
          ToolContext,
          ToolEvent,
          ToolStateSchema,
          any,
          ResolveTypegenMeta<TypegenDisabled, ToolEvent, BaseActionObject, ServiceMap>
        >
      >,
    ) => {
      state.tool = action.payload;
    },
  },
});

export default toolSlice;
