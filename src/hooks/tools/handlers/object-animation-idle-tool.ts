import { AppDispatch } from '../../../store/create-store';
import { toolService } from '../../../store/threed/tool/machine/object-tool-machine';
import { sceneEditToolHandlers } from './scene-edit-tool-functions';
import figureComposerSlice, {
  BoneSelectState,
  ComposerSelectState,
} from '../../../store/threed/figure-composer/slice';
import camelcase from 'camelcase';

export const createObjectAnimationToolHandler = (
  dispatch: AppDispatch,
): sceneEditToolHandlers => {
  return {
    figureComposerHandlers: {
      onMouseDown(_uuid, _event, _raycaster) {
        return;
      },
      onMouseMove(_uuid, _event, _raycaster) {
        return;
      },
      onMouseUp(_uuid, _event, _raycaster) {
        return;
      },
    },
    emptyHandlers: {
      onMouseDown() {
        return;
      },
      onMouseUp() {
        return;
      },
    },
  };
};
