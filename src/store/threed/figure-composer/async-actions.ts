import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootStateOrAny } from 'react-redux';
import { GetRoomsRequest, GetRoomsRoomIdRequest, Room } from '../../../codegen/api/fetch';
import { RootState } from '../../create-store';

export interface fetchRoomsPayload {
  code: number; //200 ok 404 notfound 500 error
}
export const asyncFetchRooms = createAsyncThunk<
  fetchRoomsPayload,
  { request: GetRoomsRequest; apiKey: string },
  {
    state: RootState;
    dispatch: any;
  }
>(
  'threed/figure-composer/asyncLoadNewVRM',
  async (payload: { filename: string }): Promise<fetchRoomsPayload> => {
    // Install GLTFLoader plugin
    loader.register(parser => {
      return new VRMLoaderPlugin(parser);
    });

    const api = getVoiceChatApi(payload.filename);

    const rooms = await api.getRooms(payload.request);

    return { rooms: rooms };
  },
);

export interface fetchRoomPayload {
  room: Room;
}

export const asyncFetchRoomById = createAsyncThunk<
  fetchRoomPayload,
  { request: GetRoomsRoomIdRequest; apiKey: string }
>(
  'db/room/asyncFetchRooms',
  async (payload: {
    request: GetRoomsRoomIdRequest;
    apiKey: string;
  }): Promise<fetchRoomPayload> => {
    const api = getVoiceChatApi(payload.apiKey);

    const room = await api.getRoomsRoomId(payload.request);

    return { room: room };
  },
);
