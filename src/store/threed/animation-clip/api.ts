import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { useDispatch } from 'react-redux';
import { AnimationClip } from 'three';
import {
  loadMixamoAnimation,
  loadMixamoAnimationClip,
} from '../../../util/threed/animation-loader';
import { FigureComposerAnimationClipStateSlice } from './slice';

export const animationClipApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  reducerPath: 'animationClipApi',
  endpoints: builder => ({
    loadAnimationClip: builder.mutation<
      THREE.Group,
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
          const clip = await loadMixamoAnimationClip(url);
          return { data: clip };
        } catch (error: any) {
          return { error: error.message || 'Unknown error' };
        }
      },
      onQueryStarted: (args, { dispatch, queryFulfilled }) => {
        queryFulfilled.then(result => {
          if (result.data) {
            dispatch(
              FigureComposerAnimationClipStateSlice.actions.addMixamoAnimationClip({
                figureUUID: args.figureUUID,
                trackUUID: args.trackUUID,
                mixamoAnimationAsset: result.data,
              }),
            );
          }
        });
      },
    }),
  }),
});

export const { useLoadAnimationClipMutation } = animationClipApi;
