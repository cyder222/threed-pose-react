import { sceneEditToolHandlers } from './scene-edit-tool-functions';
import { AppDispatch } from '../../../store/create-store';
import { toolService } from '../../../store/threed/tool/machine/object-tool-machine';
import figureComposerSlice, {
  BoneSelectState,
  ComposerSelectState,
} from '../../../store/threed/figure-composer/slice';
import FigureComposer from '../../../components/threed/figure-composer';

export const createObjectBoneSelectToolHandler = (
  dispatch: AppDispatch,
): sceneEditToolHandlers => {
  return {
    figureComposerHandlers: {
      onMouseDown(_composerUUID, _event, _raycaster) {
        return;
      },
      onMouseMove(_composerUUID, _event, _raycaster) {
        return;
      },
      onMouseUp(_composerUUID, _event, _raycaster) {
        return;
      },
    },
    sceneEditToolBoneControlHandlers: {
      onMouseDown(composerUUID, targetBoneName, event, _raycaster) {
        toolService.send('SELECT');
        event?.stopPropagation();
        dispatch(
          figureComposerSlice.actions.changeBoneSelectState({
            id: composerUUID,
            boneName: targetBoneName,
            selectState: BoneSelectState.selected,
          }),
        );
      },
    },
  };
};

export const createObjectBoneSelectedToolHandler = (
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
        toolService.send('CANCEL');
        dispatch(figureComposerSlice.actions.clearAllSelectState());
        dispatch(figureComposerSlice.actions.clearAlBonelSelectState());
      },
      onMouseUp() {
        toolService.send('END_TOOL_OPERATION');
      },
    },
  };
};
