/* eslint-disable @typescript-eslint/ban-types */
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
import {
  createObjectBoneSelectToolHandler,
  createObjectBoneSelectedToolHandler,
} from '../../../../hooks/tools/handlers/object-bone-select-tool';
import { createObjectBoneMoveToolHandler } from '../../../../hooks/tools/handlers/object-bone-move-tool';
import { createHandler } from '../../../../hooks/tools/handlers/scene-edit-tool-functions';
import toolSlice from '../slice';

// State Machine

export interface ToolStateSchema {
  states: {
    idle: Record<never, never>;
    target_selecting: Record<never, never>;
    adding: Record<never, never>;
    target_selected: {
      states: {
        move: {
          states: {
            wait: Record<never, never>;
            processing: Record<never, never>;
          };
        };
        rotate: {
          states: {
            wait: Record<never, never>;
            processing: Record<never, never>;
          };
        };
        scale: {
          states: {
            wait: Record<never, never>;
            processing: Record<never, never>;
          };
        };
        pose: {
          states: {
            pose_target_selected: {
              states: {
                pose_target_move: {
                  states: {
                    wait: Record<never, never>;
                    processing: Record<never, never>;
                  };
                };
                pose_target_rotate: {
                  states: {
                    wait: Record<never, never>;
                    processing: Record<never, never>;
                  };
                };
                pose_target_scale: {
                  states: {
                    wait: Record<never, never>;
                    processing: Record<never, never>;
                  };
                };
              };
            };
            pose_idle: Record<never, never>;
          };
        };
        animation: {
          states: {
            animation_idle: Record<never, never>;
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
  | { type: 'ANIMATION' }
  | { type: 'ADD_OBJECT' }
  | { type: 'START_TOOL_OPERATION' }
  | { type: 'END_TOOL_OPERATION' }
  | { type: 'CANCEL' };

export interface ToolContext {
  selectedObject?: string;
  isProcessing?: boolean;
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
      initial: 'move',
      entry: context => {
        context.handlerCreator = createObjectSelectedToolHandler;
      },
      on: {
        MOVE: 'target_selected.move',
        ROTATE: 'target_selected.rotate',
        SCALE: 'target_selected.scale',
        POSE: 'target_selected.pose.pose_idle',
        ANIMATION: 'target_selected.animation.animation_idle',
        CANCEL: '#tool.target_selecting',
      },
      exit: 'onSelectingExit',
      states: {
        move: {
          initial: 'wait',
          entry: context => {
            context.handlerCreator = createObjectMoveToolHandler;
          },
          states: {
            processing: {
              on: {
                END_TOOL_OPERATION: 'wait',
              },
              entry: context => {
                context.isProcessing = true;
              },
              exit: context => {
                context.isProcessing = false;
              },
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
          initial: 'wait',
          entry: context => {
            context.handlerCreator = createObjectMoveToolHandler;
          },

          states: {
            processing: {
              on: {
                END_TOOL_OPERATION: 'wait',
              },
              entry: context => {
                context.isProcessing = true;
              },
              exit: context => {
                context.isProcessing = false;
              },
            },
            wait: {
              on: {
                START_TOOL_OPERATION: 'processing',
              },
              entry: () => console.log('ON ENTRY TRIGGERED on move wait'),
            },
          },
          exit: 'onRotateExit',
        },
        scale: {
          initial: 'wait',
          entry: context => {
            context.handlerCreator = createObjectMoveToolHandler;
          },
          states: {
            processing: {
              on: {
                END_TOOL_OPERATION: 'wait',
              },
              entry: context => {
                context.isProcessing = true;
              },
              exit: context => {
                context.isProcessing = false;
              },
            },
            wait: {
              on: {
                START_TOOL_OPERATION: 'processing',
              },
              entry: () => console.log('ON ENTRY TRIGGERED on move wait'),
            },
          },
          exit: 'onScaleExit',
        },
        pose: {
          initial: 'pose_idle',
          states: {
            pose_idle: {
              entry: context => {
                context.handlerCreator = createObjectBoneSelectToolHandler;
              },
              on: {
                SELECT: 'pose_target_selected',
                CANCEL: '#tool.target_selected',
              },
            },
            pose_target_selected: {
              entry: context => {
                context.handlerCreator = createObjectBoneSelectedToolHandler;
              },
              initial: 'pose_target_rotate',
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
                  entry: context => {
                    context.handlerCreator = createObjectBoneMoveToolHandler;
                  },
                  initial: 'wait',
                  states: {
                    wait: {
                      on: {
                        START_TOOL_OPERATION: 'processing',
                      },
                    },
                    processing: {
                      on: {
                        END_TOOL_OPERATION: 'wait',
                      },
                      entry: context => {
                        context.isProcessing = true;
                      },
                      exit: context => {
                        context.isProcessing = false;
                      },
                    },
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
        animation: {
          initial: 'animation_idle',
          states: {
            animation_idle: {},
          },
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
