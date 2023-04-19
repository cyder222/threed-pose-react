/* eslint-disable @typescript-eslint/ban-types */
import { Dispatch, AnyAction } from '@reduxjs/toolkit';
import {
  BaseActionObject,
  interpret,
  Machine,
  MachineConfig,
  ResolveTypegenMeta,
  ServiceMap,
  State,
  TypegenDisabled,
} from 'xstate';
import { createObjectMoveToolHandler } from '../../../../hooks/tools/handlers/object-move-tool';
import {
  createObjectSelectedToolHandler,
  createObjectSelectToolHandler,
} from '../../../../hooks/tools/handlers/object-select-tool';
import { createHandler } from '../../../../hooks/tools/handlers/scene-edit-tool-functions';
import { store } from '../../../create-store';
import toolSlice from '../slice';

// State Machine

export interface ToolStateSchema {
  states: {
    idle: {};
    target_selecting: {};
    adding: {};
    target_selected: {
      states: {
        move: {
          states: {
            wait: {};
            processing: {};
          };
        };
        rotate: {
          states: {
            wait: {};
            processing: {};
          };
        };
        scale: {
          states: {
            wait: {};
            processing: {};
          };
        };
        pose: {
          states: {
            pose_target_selected: {
              states: {
                pose_target_move: {
                  states: {
                    wait: {};
                    processing: {};
                  };
                };
                pose_target_rotate: {
                  states: {
                    wait: {};
                    processing: {};
                  };
                };
                pose_target_scale: {
                  states: {
                    wait: {};
                    processing: {};
                  };
                };
              };
            };
            pose_idle: {};
          };
        };
      };
    };
  };
}

export type ToolEvent =
  | { type: 'USE_ADDING_TOOL' }
  | { type: 'USE_SELECT_TOOL' }
  | { type: 'SELECT' }
  | { type: 'MOVE' }
  | { type: 'ROTATE' }
  | { type: 'SCALE' }
  | { type: 'POSE' }
  | { type: 'ADD_OBJECT' }
  | { type: 'START_TOOL_OPERATION' }
  | { type: 'END_TOOL_OPERATION' }
  | { type: 'CANCEL' };

export interface ToolContext {
  selectedObject?: string;
  handlerCreator: createHandler;
}

const toolMachineConfig: MachineConfig<ToolContext, ToolStateSchema, ToolEvent> = {
  id: 'tool',
  initial: 'target_selecting',
  context: {
    selectedObject: undefined,
    handlerCreator: createObjectSelectToolHandler,
  },
  states: {
    idle: {
      id: 'idle',
      on: {
        SELECT: {
          target: '#tool.target_selected',
          internal: false,
        },
        USE_SELECT_TOOL: 'target_selecting',
        ADD_OBJECT: 'adding',
      },
    },
    target_selecting: {
      id: 'target_selecting',
      on: {
        SELECT: {
          target: 'target_selected',
        },
        ADD_OBJECT: 'adding',
      },

      entry: context => {
        context.handlerCreator = createObjectSelectToolHandler;
      },
    },
    adding: {
      states: {
        selecting: {},
        adding: {
          on: {
            ADDED: '#tool.idle',
          },
        },
      },
    },
    target_selected: {
      entry: context => {
        context.handlerCreator = createObjectSelectedToolHandler;
      },
      on: {
        MOVE: 'target_selected.move',
        ROTATE: 'target_selected.rotate',
        SCALE: 'target_selected.scale',
        POSE: 'target_selected.pose.pose_idle',
        CANCEL: '#tool.target_selecting',
      },
      exit: 'onSelectingExit',
      states: {
        move: {
          initial: 'wait',
          entry: context => {
            context.handlerCreator = createObjectMoveToolHandler;
          },
          on: {
            CANCEL: { target: '#tool.target_selecting' },
            ROTATE: 'rotate',
            SCALE: 'scale',
          },
          states: {
            processing: {
              on: {
                END_TOOL_OPERATION: 'wait',
              },
              entry: () => console.log('ON ENTRY TRIGGERED on move processing'),
            },
            wait: {
              on: {
                START_TOOL_OPERATION: 'processing',
              },
              entry: () => console.log('ON ENTRY TRIGGERED on move wait'),
            },
          },
          exit: 'onMoveExit',
        },
        rotate: {
          on: {
            CANCEL: '#tool.target_selected',
          },
          states: {
            processing: {},
            wait: {},
          },
          entry: 'onRotateEntry',
          exit: 'onRotateExit',
        },
        scale: {
          on: {
            CANCEL: '#tool.target_selected',
          },
          states: {
            processing: {},
            wait: {},
          },
          entry: 'onScaleEntry',
          exit: 'onScaleExit',
        },
        pose: {
          initial: 'pose_idle',
          states: {
            pose_idle: {
              on: {
                SELECT: 'pose_target_selected',
                CANCEL: '#tool.target_selected',
              },
            },
            pose_target_selected: {
              on: {
                MOVE: 'pose_target_selected.pose_target_move',
                ROTATE: 'pose_target_selected.pose_target_rotate',
                SCALE: 'pose_target_selected.pose_target_scale',
                CANCEL: '#tool.target_selected.pose.pose_idle',
              },
              states: {
                pose_target_move: {
                  states: {
                    wait: {},
                    processing: {},
                  },
                },
                pose_target_rotate: {
                  states: {
                    wait: {},
                    processing: {},
                  },
                },
                pose_target_scale: {
                  states: {
                    wait: {},
                    processing: {},
                  },
                },
              },
            },
          },
          entry: 'onPoseEntry',
          exit: 'onPoseExit',
        },
      },
    },
  },
};

const toolMachine = Machine<ToolContext, ToolStateSchema, ToolEvent>(toolMachineConfig);

const Service = interpret(toolMachine);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toolMachineInitlizer = (sv: any, st: any) => {
  sv.onTransition(
    (
      state: State<
        ToolContext,
        ToolEvent,
        ToolStateSchema,
        any,
        ResolveTypegenMeta<TypegenDisabled, ToolEvent, BaseActionObject, ServiceMap>
      >,
    ) => {
      st.dispatch(toolSlice.actions.syncXstate(state));
    },
  );
  sv.start();
};
export const toolService = Service;
