import { sceneEditToolHandlers } from './scene-edit-tool-functions';
import { AppDispatch } from '../../../store/create-store';
import { toolService } from '../../../store/threed/tool/machine/object-tool-machine';
import figureComposerSlice, {
  ComposerSelectState,
} from '../../../store/threed/figure-composer/slice';

export const createObjectSelectToolHandler = (
  dispatch: AppDispatch,
): sceneEditToolHandlers => {
  return {
    figureComposerHandlers: {
      onMouseDown(composerUUID, event, _raycaster) {
        toolService.send('SELECT');
        composerUUID
          ? dispatch(
              figureComposerSlice.actions.changeSelectState({
                id: composerUUID,
                selectState: ComposerSelectState.selected,
              }),
            )
          : null;
        return;
      },
      onMouseMove(composerUUID, event, _raycaster) {
        return;
      },
      onMouseUp(composerUUID, event, _raycaster) {
        return;
      },
    },
  };
};

export const createObjectSelectedToolHandler = (
  dispatch: AppDispatch,
): sceneEditToolHandlers => {
  return {
    figureComposerHandlers: {
      onMouseDown(uuid, event, _raycaster) {
        toolService.send('MOVE');
        return;
      },
      onMouseMove(uuid, event, _raycaster) {
        return;
      },
      onMouseUp(uuid, event, _raycaster) {
        return;
      },
    },
    emptyHandlers: {
      onMouseDown() {
        toolService.send('CANCEL');
        dispatch(figureComposerSlice.actions.clearAllSelectState());
      },
      onMouseUp() {
        toolService.send('END_TOOL_OPERATION');
      },
    },
  };
};
