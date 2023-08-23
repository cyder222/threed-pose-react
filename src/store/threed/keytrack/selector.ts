import { RootState } from '../../create-store';

export const KeyTrackListSelectorKeyTrackListSelector = {
  getKeyTracks: (state: RootState, targetUUID: string) => {
    return state.animation[targetUUID];
  },
  getKeyTrack: (state: RootState, targetUUID: string, trackUUID: string) => {
    return state.animation?.[targetUUID]?.[trackUUID] || null;
  },
};
