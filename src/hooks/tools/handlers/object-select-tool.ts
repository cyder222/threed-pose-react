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
      onMouseDown(composerUUID, _event, _raycaster) {
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
      onMouseMove(_composerUUID, _event, _raycaster) {
        return;
      },
      onMouseUp(_composerUUID, _event, _raycaster) {
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
      onMouseDown(_uuid, _event, _raycaster) {
        toolService.send('MOVE');
        return;
      },
      onMouseMove(_uuid, _event, _raycaster) {
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
