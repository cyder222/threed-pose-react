import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AnimationPlaybackState = {
  currentFrame: number;
  currentTrackUUID: string;
  isPlaying: boolean;
  playbackRate: number;
  isLoop: boolean;
  playbackStartFrame: number;
  playbackEndFrame: number;
};

const initialPlaybackState: AnimationPlaybackState = {
  currentFrame: 0,
  currentTrackUUID: '',
  isPlaying: false,
  playbackRate: 1.0,
  isLoop: false,
  playbackStartFrame: 0,
  playbackEndFrame: 100,
};

const animationPlaybackSlice = createSlice({
  name: 'animationPlayback',
  initialState: initialPlaybackState,
  reducers: {
    setCurrentFrame: (state, action: PayloadAction<number>) => {
      state.currentFrame = action.payload;
    },
    setCurrentTrack: (state, action: PayloadAction<string>) => {
      state.currentTrackUUID = action.payload;
    },
    togglePlayback: state => {
      state.isPlaying = !state.isPlaying;
    },
    setPlaybackRate: (state, action: PayloadAction<number>) => {
      state.playbackRate = action.payload;
    },
  },
});
