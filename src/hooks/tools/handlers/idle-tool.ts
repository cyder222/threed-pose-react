import { sceneEditToolHandlers } from './scene-edit-tool-functions';
import { AppDispatch } from '../../../store/create-store';
import { toolService } from '../../../store/threed/tool/machine/object-tool-machine';

export const createObjectToolIdleHandler = (
  dispatch: AppDispatch,
): sceneEditToolHandlers => {
  return {
    figureComposerHandlers: {
      onMouseDown(event, _raycaster) {
        return;
      },
      onMouseMove(event, _raycaster) {
        return;
      },
      onMouseUp(event, _raycaster) {
        return;
      },
    },
  };
};
