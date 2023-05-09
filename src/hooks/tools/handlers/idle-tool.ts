import { sceneEditToolHandlers } from './scene-edit-tool-functions';
import { AppDispatch } from '../../../store/create-store';

export const createObjectToolIdleHandler = (
  _dispatch: AppDispatch,
): sceneEditToolHandlers => {
  return {
    figureComposerHandlers: {
      onMouseDown(_event, _raycaster) {
        return;
      },
      onMouseMove(_event, _raycaster) {
        return;
      },
      onMouseUp(_event, _raycaster) {
        return;
      },
    },
  };
};
