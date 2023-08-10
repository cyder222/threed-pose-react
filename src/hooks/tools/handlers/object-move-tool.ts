import { TransformControls } from '@react-three/drei';
import { AppDispatch } from '../../../store/create-store';
import figureComposerSlice from '../../../store/threed/figure-composer/slice';
import { toolService } from '../../../store/threed/tool/machine/object-tool-machine';
import { sceneEditToolHandlers } from './scene-edit-tool-functions';

export const createObjectMoveToolHandler = (
  dispatch: AppDispatch,
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
      onMouseUp(uuid, event, _raycaster) {
        toolService.send('END_TOOL_OPERATION');
        if (event?.target?.object) {
          dispatch(
            figureComposerSlice.actions.updateTransformMatrix({
              id: uuid,
              matrix: event.target.object.matrix,
            }),
          );
          event.stopPropagation?.();
        }
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
