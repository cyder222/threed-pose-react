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
        event?.stopPropagation();
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
      onMouseUp(_composerUUID, event, _raycaster) {
        event?.stopPropagation();
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
      onMouseDown(_uuid, event, _raycaster) {
        toolService.send('MOVE');
        event?.stopPropagation();
        return;
      },
      onMouseMove(_uuid, _event, _raycaster) {
        return;
      },
      onMouseUp(_uuid, event, _raycaster) {
        event?.stopPropagation();
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
