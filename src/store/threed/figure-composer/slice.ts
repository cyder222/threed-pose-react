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

export type VRMPoseNodeState = {
  position: SerializedVector3;
  rotation: SerializedEuler;
  scale: SerializedVector3;
};

export type VRMEntity = {
  translate: SerializedVector3;
  scale: SerializedVector3;
  rotation: SerializedEuler;
  vrmPose: VRMPoseState;
  vrmBoneSelectState: VRMBoneSelectState;
};

export enum composerRenderState {
  renderVRM = 1,
  renderPoseBone = 1 << 1,
  renderControlCube = 1 << 2,
  renderAdditionalFacePoint = 1 << 3,
}

export enum ComposerSelectState {
  none = 0,
  selected = 1,
}

export enum BoneSelectState {
  none = 0,
  selected = 1,
}

export type AdditionalInfomationFace = {
  [partName in 'Lear' | 'Nose' | 'Rear' | 'Leye' | 'Reye']: {
    a: number;
    b: number;
    c: number;
  };
};

export type FigureComposerEntity = {
  uuid: string;
  vrmFilename?: string;

  vrmState: VRMEntity;
  renderState: number; // composerRenderStateの&演算で入れる、
  additionInfomationFace?: AdditionalInfomationFace;
  composerSelectState: ComposerSelectState;
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
          translate: serializeVector3(new THREE.Vector3()),
          scale: serializeVector3(new THREE.Vector3()),
          rotation: serializeEuler(new THREE.Euler()),
          vrmPose: {},
          vrmBoneSelectState: {},
        },
        uuid: uuid,
        renderState:
          composerRenderState.renderVRM &
          composerRenderState.renderPoseBone &
          composerRenderState.renderControlCube &
          composerRenderState.renderAdditionalFacePoint,
        composerSelectState: ComposerSelectState.none,
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
        const vrmState = {
          position: pose[poseKey].position,
          rotation: pose[poseKey].rotation,
          scale: pose[poseKey].scale,
        };
        state[id].vrmState.vrmPose[poseKey] = vrmState;
      });
    },
    translateComposer: (
      state,
      action: PayloadAction<{ id: string; translateTo: THREE.Vector3 }>,
    ) => {
      const { id, translateTo } = action.payload;
      state[id].vrmState.translate = serializeVector3(translateTo);
    },
    scaleComposer: (
      state,
      action: PayloadAction<{ id: string; scaleTo: THREE.Vector3 }>,
    ) => {
      const { id, scaleTo } = action.payload;
      state[id].vrmState.scale = serializeVector3(scaleTo);
    },
    rotateComposer: (
      state,
      action: PayloadAction<{ id: string; rotateTo: THREE.Euler }>,
    ) => {
      const { id, rotateTo } = action.payload;
      state[id].vrmState.rotation = serializeEuler(rotateTo);
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
    changeDisplayState: (
      state,
      action: PayloadAction<{ id: string; displayState: number }>,
    ) => {
      const { id, displayState } = action.payload;
      state[id].renderState = displayState;
    },
  },
});

export default figureComposerSlice;
