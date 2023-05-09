import { AppDispatch } from '../../../store/create-store';
import figureComposerSlice from '../../../store/threed/figure-composer/slice';
import { toolService } from '../../../store/threed/tool/machine/object-tool-machine';
import { sceneEditToolHandlers } from './scene-edit-tool-functions';

export const createObjectMoveToolHandler = (
  _dispatch: AppDispatch,
): sceneEditToolHandlers => {
  return {
    figureComposerHandlers: {
      onMouseDown(_uuid, _event, _raycaster) {
        toolService.send('START_TOOL_OPERATION');
        return;
      },
      onMouseMove(_uuid, _event, _raycaster) {
        return;
      },
      onMouseUp(_uuid, _event, _raycaster) {
        toolService.send('END_TOOL_OPERATION');
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
