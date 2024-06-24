import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AnimationClip, AnimationMixer } from 'three';

export type AnimationPlaybackState = {
  currentTime: number;
  isPlaying: boolean;
  playbackRate: number;
  isLoop: boolean;
  playSpeedFps: number;
  playbackStartTime: number;
  isBackgroundMode: boolean;
};

const initialPlaybackState: AnimationPlaybackState = {
  currentTime: 0,
  isPlaying: true,
  playbackRate: 1.0,
  isLoop: true,
  playSpeedFps: 30,
  playbackStartTime: 0,
  isBackgroundMode: false,
};

export const animationPlaybackSlice = createSlice({
  name: 'animationPlayback',
  initialState: initialPlaybackState,
  reducers: {
    initialize: (state, action: PayloadAction<{ fps: number }>) => {
      state.currentTime = 0;
      state.isPlaying = true;
      state.isLoop = true;
      state.playSpeedFps = 30;
      state.playbackStartTime = 0;
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    togglePlayback: state => {
      state.isPlaying = !state.isPlaying;
    },
    setPlaybackRate: (state, action: PayloadAction<number>) => {
      state.playbackRate = action.payload;
    },
    setBackgroundMode: (state, action: PayloadAction<boolean>) => {
      state.isBackgroundMode = action.payload;
    },
  },
});
