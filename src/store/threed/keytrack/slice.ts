import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';

export type VRMPoseState = {
  [key: string]: VRMPoseNodeState;
};

export type VRMPoseNodeState = {
  matrix4: number[];
};

export type VRMTransformState = {
  matrix4: number[];
};

export type KeyFrameEntity = {
  currentTargetTransform: VRMTransformState;
  vrmPose: VRMPoseState;
} | null;

export type KeyTrackEntity = {
  keyframes: KeyFrameEntity[];
};

export type KeyTracksEntity = KeyTrackEntity[];

export type FigureComposerKeyTracskState = {
  [figureUUID: string]: { [trackUUID: string]: KeyTrackEntity };
};

export const initialState: FigureComposerKeyTracskState = {};

export const figureComposerKeyTracksSlice = createSlice({
  name: 'figureComposerKeyTracksSlice',
  initialState,
  reducers: {
    addNewEmptyTrack: (
      state,
      action: PayloadAction<{
        figureUUID: string;
        trackUUID: string;
        initialFrameAmount: number;
      }>,
    ) => {
      const { figureUUID, initialFrameAmount } = action.payload;
      const newTrackUUID = uuid();
      if (!state[figureUUID]) {
        state[figureUUID] = {};
      }
      const initialKeyframes = new Array(initialFrameAmount).fill(null);
      state[figureUUID][newTrackUUID] = { keyframes: initialKeyframes };
    },
    addNewTrackFromKeyTracks: (
      state,
      action: PayloadAction<{
        figureUUID: string;
        trackUUID: string;
        keyTrack: KeyTrackEntity;
      }>,
    ) => {
      const { figureUUID, trackUUID, keyTrack } = action.payload;
      if (!state[figureUUID]) {
        state[figureUUID] = {};
      }
      state[figureUUID][trackUUID] = keyTrack;
    },
    addOrUpdateNewKeyFrame: (
      state,
      action: PayloadAction<{
        uuid: string;
        trackUUID: string;
        insertFrame: number;
        keyFrame: KeyFrameEntity;
      }>,
    ) => {
      const { uuid, trackUUID, insertFrame, keyFrame } = action.payload;

      if (state[uuid] && state[uuid][trackUUID]) {
        const keyTrack = state[uuid][trackUUID];

        // insertFrameがkeyframesの長さより大きい場合、nullで配列をinsertFrameの２倍の大きさまで拡張する
        while (insertFrame * 2 >= keyTrack.keyframes.length) {
          keyTrack.keyframes.push(null);
        }

        keyTrack.keyframes[insertFrame] = keyFrame;
      }
    },
    resizeKeyFrames: (
      state,
      action: PayloadAction<{ uuid: string; trackUUID: string; newSize: number }>,
    ) => {
      const { uuid, trackUUID, newSize } = action.payload;

      if (state[uuid] && state[uuid][trackUUID]) {
        const keyTrack = state[uuid][trackUUID];

        while (newSize > keyTrack.keyframes.length) {
          keyTrack.keyframes.push(null);
        }
        // 逆にnewSizeが小さい時は、何もしないで、現状のフレームは保持しておく
      }
    },
  },
});
