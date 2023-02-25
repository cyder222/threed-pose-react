// フィギュアコンポーザー（VRM + コントロールボール + poseBone + etc...)
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import THREE from 'three';
import { VRMHumanBoneName } from '@pixiv/three-vrm';

export type FigureComposerEntity = {
  uuid: number;
  vrmFilename: string;

  vrmTranslate: THREE.Vector3;
  vrmRotate: THREE.Vector3;
  vrmPose: { [boneName in VRMHumanBoneName]: THREE.Vector3 };
  additionInfomationFace: {
    [partName in 'Lear' | 'Nose' | 'Rear']: {
      a: number;
      b: number;
      c: number;
    };
  };
};

export type FigureComposersState = {
  figureComposers: { [key: number]: FigureComposerEntity };
};

export const initialState: FigureComposersState = { figureComposers: {} };

const roomSlice = createSlice({
  name: 'figureComposers',
  initialState,
  reducers: {
    updateName: (state, action: PayloadAction<{ id: string; name: string }>) => {
      return {
        ...state,
        name: action.payload,
      };
    },
    updateNickname: (state, action: PayloadAction<{ id: string; nickname: string }>) => {
      return {
        ...state,
        nickname: action.payload,
      };
    },
    updateRoom: (state, action: PayloadAction<{ room: RoomEntity }>) => {
      const room = action.payload.room;
      room.description === undefined ? (room.description = '') : null;
      room.mainLangage === undefined ? (room.mainLangage = '') : null;
      room.category === undefined ? (room.category = { id: 0, name: 'なし' }) : null;
      room.currentUserNum === undefined ? (room.currentUserNum = 0) : null;
      room.maxUserNum === undefined ? (room.maxUserNum = 0) : null;

      state.rooms[room.roomIdentity] = room;
    },
  },
  extraReducers: builder => {
    builder.addCase(asyncFetchRooms.fulfilled, (state, action) => {
      const rooms = action.payload.rooms;
      const mapedRoom = rooms?.reduce((prev, next: Room) => {
        prev[next.id] = next;
        return prev;
      }, {});
      state.rooms = Object.assign(state.rooms, mapedRoom);
      return state;
    });
    builder.addCase(HYDRATE, (state, action: any) => {
      console.log(action.payload.room);
      return {
        ...state,
        ...action.payload.room,
      };
    });
  },
});

export default roomSlice;
