// フィギュアコンポーザー（VRM + コントロールボール + poseBone + etc...)
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import * as THREE from 'three';
import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm';
import { v4 as uuidv4 } from 'uuid';

export type VRMPoseNodeState = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
};
export type VRMEntity = {
  translate: THREE.Vector3;
  scale: THREE.Vector3;
  rotation: THREE.Euler;
  vrmPose: Map<VRMHumanBoneName, VRMPoseNodeState>;
};

export enum composerRenderState {
  renderVRM = 1,
  renderPoseBone = 1 << 1,
  renderControlCube = 1 << 2,
  renderAdditionalFacePoint = 1 << 3,
}

export enum composerSelectState {
  none = 0,
  selected = 1,
}

export type FigureComposerEntity = {
  uuid: string;
  vrmFilename?: string;

  vrmState: VRMEntity;
  renderState: number; // composerRenderStateの&演算で入れる、
  additionInfomationFace?: {
    [partName in 'Lear' | 'Nose' | 'Rear']: {
      a: number;
      b: number;
      c: number;
    };
  };
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
          translate: new THREE.Vector3(),
          scale: new THREE.Vector3(),
          rotation: new THREE.Euler(),
          vrmPose: new Map<VRMHumanBoneName, VRMPoseNodeState>(),
        },
        uuid: uuid,
        renderState:
          composerRenderState.renderVRM &
          composerRenderState.renderPoseBone &
          composerRenderState.renderControlCube &
          composerRenderState.renderAdditionalFacePoint,
      };
      state[uuid] = composerState;
    },
    translateComposer: (
      state,
      action: PayloadAction<{ id: string; translateTo: THREE.Vector3 }>,
    ) => {
      const { id, translateTo } = action.payload;
      state[id].vrmState.translate = translateTo;
    },
    scaleComposer: (
      state,
      action: PayloadAction<{ id: string; scale: THREE.Vector3 }>,
    ) => {
      const { id, scale } = action.payload;
      state[id].vrmState.scale = scale;
    },
    rotateComposer: (
      state,
      action: PayloadAction<{ id: string; rotate: THREE.Euler }>,
    ) => {
      const { id, rotate } = action.payload;
      state[id].vrmState.rotation = rotate;
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
      position: boneNode.position,
      scale: boneNode.scale,
      rotation: boneNode.rotation,
    };
    boneState.set(name, pose);
  }

  const vrmPose: Map<VRMHumanBoneName, VRMPoseNodeState> = boneState;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const composerState = {
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
