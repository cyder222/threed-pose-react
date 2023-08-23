import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { useDispatch } from 'react-redux';
import { loadMixamoAnimation } from '../../../util/threed/animation-loader';
import { figureComposerKeyTracksSlice, KeyTrackEntity } from './slice';

export const animationApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: builder => ({
    loadAnimation: builder.mutation<
      KeyTrackEntity,
      { file: File; figureUUID: string; trackUUID: string }
    >({
      queryFn: async ({ file }) => {
        const reader = new FileReader();
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = reject;
          reader.readAsArrayBuffer(file);
        });

        const url = URL.createObjectURL(new Blob([new Uint8Array(arrayBuffer)]));
        try {
          const keyTrack = await loadMixamoAnimation(url);
          return { data: keyTrack };
        } catch (error: any) {
          return { error: error.message || 'Unknown error' };
        }
      },
      onQueryStarted: (args, { dispatch, queryFulfilled }) => {
        queryFulfilled.then(result => {
          if (result.data) {
            dispatch(
              figureComposerKeyTracksSlice.actions.addOrUpdateTrackFromKeyTracks({
                figureUUID: args.figureUUID,
                trackUUID: args.trackUUID,
                keyTrack: result.data,
              }),
            );
          }
        });
      },
    }),
  }),
});

export const { useLoadAnimationMutation } = animationApi;
