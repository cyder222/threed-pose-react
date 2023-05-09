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
  vrmPose: [VRMHumanBoneName, VRMPoseNodeState][];
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
          vrmPose: [],
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
    changeDisplayState: (
      state,
      action: PayloadAction<{ id: string; displayState: number }>,
    ) => {
      const { id, displayState } = action.payload;
      state[id].renderState = displayState;
    },
  },
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _vrmSetter = (vrm: VRM, uuid: string) => {
  const targetUUID = uuid;

  const boneState = new Map<VRMHumanBoneName, VRMPoseNodeState>();
  for (const boneName in VRMHumanBoneName) {
    const name = boneName as VRMHumanBoneName;
    const boneNode = vrm.humanoid.getNormalizedBoneNode(name);
    if (boneNode == null) {
      continue;
    }
    const pose: VRMPoseNodeState = {
      position: serializeVector3(boneNode.position),
      scale: serializeVector3(boneNode.scale),
      rotation: serializeEuler(boneNode.rotation),
    };
    boneState.set(name, pose);
  }

  const vrmPose: Map<VRMHumanBoneName, VRMPoseNodeState> = boneState;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _composerState = {
    vrmState: {
      translate: vrm.scene.position,
      scale: vrm.scene.scale,
      rotation: vrm.scene.rotation,
      vrmPose,
    },
    uuid: targetUUID ? targetUUID : vrm.scene.uuid,
    renderState:
      composerRenderState.renderVRM &
      composerRenderState.renderPoseBone &
      composerRenderState.renderControlCube &
      composerRenderState.renderAdditionalFacePoint,
  };
};

export default figureComposerSlice;
