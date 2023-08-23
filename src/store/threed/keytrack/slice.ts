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
  [time: number]: KeyFrameEntity;
};

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
      const initialKeyframes: KeyTrackEntity = {};

      state[figureUUID][newTrackUUID] = initialKeyframes;
    },
    addOrUpdateTrackFromKeyTracks: (
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
        time: number;
        keyFrame: KeyFrameEntity;
      }>,
    ) => {
      const { uuid, trackUUID, time, keyFrame } = action.payload;

      if (state[uuid] && state[uuid][trackUUID]) {
        const keyTrack = state[uuid][trackUUID];

        keyTrack[time] = keyFrame;
      }
    },
  },
});
