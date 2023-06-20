import { AppDispatch } from '../../../store/create-store';
import { toolService } from '../../../store/threed/tool/machine/object-tool-machine';
import { sceneEditToolHandlers } from './scene-edit-tool-functions';

export const createObjectMoveToolHandler = (
  _dispatch: AppDispatch,
): sceneEditToolHandlers => {
  return {
    figureComposerHandlers: {
      onMouseDown(_uuid, event, _raycaster) {
        toolService.send('START_TOOL_OPERATION');
        event?.stopPropagation?.();
        return;
      },
      onMouseMove(_uuid, _event, _raycaster) {
        return;
      },
      onMouseUp(_uuid, event, _raycaster) {
        toolService.send('END_TOOL_OPERATION');
        event?.stopPropagation?.();
        return;
      },
    },
    emptyHandlers: {
      onMouseDown() {
        return;
      },
      onMouseUp() {
        toolService.send('END_TOOL_OPERATION');
      },
    },
  };
};
