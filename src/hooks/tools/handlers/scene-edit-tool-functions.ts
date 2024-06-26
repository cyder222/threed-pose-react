import { AppDispatch } from '../../../store/create-store';

export type SceneEditToolHandlerOptions = {
  onMouseDown?: (event?: THREE.Event, raycaster?: THREE.Raycaster) => void;
  onMouseMove?: (event?: THREE.Event, raycaster?: THREE.Raycaster) => void;
  onMouseUp?: (event?: THREE.Event, raycaster?: THREE.Raycaster) => void;
};

export type SceneEditToolFigureComposersHandlerOptions = {
  onMouseDown?: (
    composerUUID: string,
    event?: THREE.Event,
    raycaster?: THREE.Raycaster,
  ) => void;
  onMouseMove?: (
    composerUUID: string,
    event?: THREE.Event,
    raycaster?: THREE.Raycaster,
  ) => void;
  onMouseUp?: (
    composerUUID: string,
    event?: THREE.Event,
    raycaster?: THREE.Raycaster,
  ) => void;
};

export type SceneEditToolBoneControlHandlers = {
  onMouseDown?: (
    composerUUID: string,
    targetBoneName: string,
    event?: THREE.Event,
    raycaster?: THREE.Raycaster,
  ) => void;
  onMouseMove?: (
    composerUUID: string,
    targetBoneName: string,
    event?: THREE.Event,
    raycaster?: THREE.Raycaster,
  ) => void;
  onMouseUp?: (
    composerUUID: string,
    targetBoneName: string,
    event?: THREE.Event,
    raycaster?: THREE.Raycaster,
  ) => void;
};

export interface sceneEditToolHandlers {
  figureComposerHandlers?: SceneEditToolFigureComposersHandlerOptions;
  emptyHandlers?: SceneEditToolHandlerOptions;
  sceneEditToolBoneControlHandlers?: SceneEditToolBoneControlHandlers;
}

export type createHandler = (dispatch: AppDispatch) => sceneEditToolHandlers;
