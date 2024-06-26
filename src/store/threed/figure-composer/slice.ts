// フィギュアコンポーザー（VRM + コントロールボール + poseBone + etc...)
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import * as THREE from 'three';
import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm';
import { v4 as uuidv4 } from 'uuid';
import {
  SerializedVector3,
  SerializedEuler,
  serializeVector3,
  serializeEuler,
} from '../../../util/store/three-seiralize';
import { Matrix4 } from 'three';
import { composeTransform, extractTransform } from '../../../util/calculation';
import undoable, { includeAction } from 'redux-undo';

export type VRMPoseNodeState = {
  matrix4: number[];
};

export type VRMEntity = {
  matrix4: number[];
  vrmPose: VRMPoseState;
  vrmBoneSelectState: VRMBoneSelectState;
};

export enum composerRenderState {
  renderVRM = 1,
  renderPoseBone = 1 << 1,
  renderDepth = 1 << 2,
  renderOutline = 1 << 3,
}

export enum ComposerSelectState {
  none = 0,
  selected = 1,
}

export enum BoneSelectState {
  none = 0,
  selected = 1,
}

export enum PlayMode {
  pose = 0,
  animation = 1,
}

export type additionalOpenPosePoint = 'Lear' | 'Nose' | 'Rear' | 'Leye' | 'Reye';
export type AdditionalInfomationOpenPoseFace = {
  [partName in additionalOpenPosePoint]: SerializedVector3 | null;
};

export type FigureComposerEntity = {
  uuid: string;
  vrmFilename?: string;

  vrmState: VRMEntity;
  renderState: number; // composerRenderStateの&演算で入れる、
  additionInfomationOpenPoseFace?: AdditionalInfomationOpenPoseFace;
  composerSelectState: ComposerSelectState;
  playBackMode: PlayMode;
};

export type FigureComposersState = {
  [key: string]: FigureComposerEntity;
};

export type VRMPoseState = {
  [key: string]: VRMPoseNodeState;
};

export type VRMBoneSelectState = {
  [key: string]: BoneSelectState;
};

export const initialState: FigureComposersState = {};

const figureComposerSlice = createSlice({
  name: 'figureComposers',
  initialState,
  reducers: {
    addNewComposer: (state, action: PayloadAction<{ filename: string }>) => {
      const filename = action.payload.filename;
      const uuid = uuidv4();
      const composerState = {
        vrmFilename: filename,
        vrmState: {
          matrix4: new Matrix4().identity().toArray(),
          vrmPose: {},
          vrmBoneSelectState: {},
        },
        uuid: uuid,
        renderState: composerRenderState.renderVRM,
        composerSelectState: ComposerSelectState.none,
        playBackMode: PlayMode.pose,

        additionInfomationOpenPoseFace: {
          Lear: serializeVector3(new THREE.Vector3(875, 875, 875)),
          Rear: serializeVector3(new THREE.Vector3(928, 928, 928)),
          Nose: serializeVector3(new THREE.Vector3(1980, 1988, 1877)),
          Leye: serializeVector3(new THREE.Vector3(1363, 1363, 1363)),
          Reye: serializeVector3(new THREE.Vector3(1457, 1457, 1457)),
        },
      };
      state[uuid] = composerState;
    },
    setVRMPose: (
      state,
      action: PayloadAction<{
        id: string;
        pose: VRMPoseState;
      }>,
    ) => {
      const { id, pose } = action.payload;
      Object.keys(pose).map(poseKey => {
        const vrmPoseState = {
          matrix4: pose[poseKey].matrix4,
        };
        state[id].vrmState.vrmPose[poseKey] = vrmPoseState;
      });
    },
    setadditionInfomationOpenPoseFace: (
      state,
      action: PayloadAction<{
        id: string;
        partName: additionalOpenPosePoint;
        point: THREE.Vector3;
      }>,
    ) => {
      const { id, partName, point } = action.payload;
      if (!state[id].additionInfomationOpenPoseFace) {
        state[id].additionInfomationOpenPoseFace = {
          Lear: null,
          Rear: null,
          Nose: serializeVector3(new THREE.Vector3(1875, 1988, 1877)),
          Leye: null,
          Reye: null,
        };
      }

      state[id].additionInfomationOpenPoseFace![partName] = serializeVector3(point);
    },
    translateComposer: (
      state,
      action: PayloadAction<{ id: string; translateTo: THREE.Vector3 }>,
    ) => {
      const { id, translateTo } = action.payload;
      const vrmState = state[id].vrmState;
      const { rotation, scale } = extractTransform(vrmState.matrix4);
      vrmState.matrix4 = composeTransform(action.payload.translateTo, rotation, scale);
    },
    scaleComposer: (
      state,
      action: PayloadAction<{ id: string; scaleTo: THREE.Vector3 }>,
    ) => {
      const { id, scaleTo } = action.payload;
      const vrmState = state[id].vrmState;
      const { position, rotation } = extractTransform(vrmState.matrix4);
      vrmState.matrix4 = composeTransform(position, rotation, scaleTo);
    },
    rotateComposer: (
      state,
      action: PayloadAction<{ id: string; rotateTo: THREE.Euler }>,
    ) => {
      const { id, rotateTo } = action.payload;
      const vrmState = state[id].vrmState;
      const { position, scale } = extractTransform(vrmState.matrix4);
      vrmState.matrix4 = composeTransform(position, rotateTo, scale);
    },
    changeSelectState: (
      state,
      action: PayloadAction<{ id: string; selectState: ComposerSelectState }>,
    ) => {
      const { id, selectState } = action.payload;
      state[id].composerSelectState = selectState;
    },
    clearAllSelectState: state => {
      Object.keys(state).forEach(key => {
        state[key].composerSelectState = ComposerSelectState.none;
      });
    },
    changeBoneSelectState: (
      state,
      action: PayloadAction<{
        id: string;
        boneName: string;
        selectState: BoneSelectState;
      }>,
    ) => {
      const { id, boneName, selectState } = action.payload;
      state[id].vrmState.vrmBoneSelectState[boneName] = selectState;
    },
    clearAlBonelSelectState: state => {
      Object.keys(state).forEach(k => {
        Object.keys(state[k].vrmState.vrmBoneSelectState).forEach(key => {
          state[k].vrmState.vrmBoneSelectState[key] = BoneSelectState.none;
        });
      });
    },
    updateTransformMatrix: (
      state,
      action: PayloadAction<{
        id: string;
        matrix: Matrix4;
      }>,
    ) => {
      const { id, matrix } = action.payload;
      state[id].vrmState.matrix4 = matrix.toArray();
    },
    updateBoneTransformMatrix: (
      state,
      action: PayloadAction<{
        id: string;
        boneName: string;
        matrix: Matrix4;
      }>,
    ) => {
      const { id, boneName, matrix } = action.payload;
      state[id].vrmState.vrmPose[boneName].matrix4 = matrix.toArray();
    },
    changeDisplayState: (
      state,
      action: PayloadAction<{ id: string; displayState: number }>,
    ) => {
      const { id, displayState } = action.payload;
      state[id].renderState = displayState;
    },
    changePlaybackMode: (
      state,
      action: PayloadAction<{ uuid: string; playbackMode: PlayMode }>,
    ) => {
      const { uuid, playbackMode } = action.payload;
      state[uuid].playBackMode = playbackMode;
    },
  },
});

export const undoableFigureComposerReducer = undoable(figureComposerSlice.reducer, {
  filter: includeAction([
    figureComposerSlice.actions.updateTransformMatrix.type,
    figureComposerSlice.actions.setVRMPose.type,
    figureComposerSlice.actions.updateBoneTransformMatrix.type,
  ]),
});

export default figureComposerSlice;
