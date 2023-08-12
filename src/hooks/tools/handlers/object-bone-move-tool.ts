import { AppDispatch } from '../../../store/create-store';
import { toolService } from '../../../store/threed/tool/machine/object-tool-machine';
import { sceneEditToolHandlers } from './scene-edit-tool-functions';
import figureComposerSlice, {
  BoneSelectState,
  ComposerSelectState,
} from '../../../store/threed/figure-composer/slice';
import camelcase from 'camelcase';

export const createObjectBoneMoveToolHandler = (
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
    sceneEditToolBoneControlHandlers: {
      onMouseDown(composerUUID, targetBoneName, event, _raycaster) {
        event?.stopPropagation?.();
        dispatch(figureComposerSlice.actions.clearAlBonelSelectState());
        dispatch(
          figureComposerSlice.actions.changeBoneSelectState({
            id: composerUUID,
            boneName: targetBoneName,
            selectState: BoneSelectState.selected,
          }),
        );
        toolService.send('START_TOOL_OPERATION');
        return;
      },
      onMouseMove(_uuid, _targetBoneName, _event, _raycaster) {
        return;
      },
      onMouseUp(uuid, targetBoneName, event, _raycaster) {
        toolService.send('END_TOOL_OPERATION');

        if (!event) return;
        event?.stopPropagation?.();
        dispatch(
          figureComposerSlice.actions.updateBoneTransformMatrix({
            id: uuid,
            boneName: camelcase(targetBoneName),
            matrix: event.target.object.matrix,
          }),
        );
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
