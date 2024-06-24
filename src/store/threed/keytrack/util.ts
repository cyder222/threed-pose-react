import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm';
import * as THREE from 'three';
import { KeyTrackEntity } from './slice';

type MatrixData = { [time: number]: { [boneName: string]: number[] } };

export function extractMatrixDataFromClip(clip: THREE.AnimationClip): MatrixData {
  const data: MatrixData = {};

  clip.tracks.forEach(track => {
    const trackSplitted = track.name.split('.');
    const boneName = trackSplitted[0];

    track.times.forEach((time, index) => {
      if (!data[time]) {
        data[time] = {};
      }

      const matrix = new THREE.Matrix4();
      const valueStartIdx = track.getValueSize() * index;
      const values = track.values.slice(
        valueStartIdx,
        valueStartIdx + track.getValueSize(),
      );

      if (track instanceof THREE.QuaternionKeyframeTrack) {
        const quaternion = new THREE.Quaternion().fromArray(values);
        matrix.makeRotationFromQuaternion(quaternion);
      } else if (
        track instanceof THREE.VectorKeyframeTrack &&
        track.name.includes('.position')
      ) {
        const position = new THREE.Vector3().fromArray(values);
        matrix.setPosition(position);
      } else if (
        track instanceof THREE.VectorKeyframeTrack &&
        track.name.includes('.scale')
      ) {
        const scale = new THREE.Vector3().fromArray(values);
        matrix.scale(scale);
      }

      data[time][boneName] = matrix.toArray();
    });
  });

  return data;
}
export function createAnimationClipFromMatrixData(
  matrixData: KeyTrackEntity,
  vrm: VRM,
): THREE.AnimationClip {
  const tracks: THREE.KeyframeTrack[] = [];
  const allBoneNames = Object.values(matrixData).flatMap(data =>
    Object.keys(data ? data.vrmPose : []),
  );
  const uniqueBoneNames = Array.from(new Set(allBoneNames));

  uniqueBoneNames.forEach(boneName => {
    const vrmBoneNode = vrm.humanoid?.getRawBoneNode(boneName as VRMHumanBoneName);
    if (!vrmBoneNode) return; // このボーン名に対応するVRMボーンノードが存在しない場合はスキップ

    const vrmNodeName = vrmBoneNode.name;
    const times: number[] = [];
    const positionTrackData: number[] = [];
    const quaternionTrackData: number[] = [];
    const scaleTrackData: number[] = [];

    Object.entries(matrixData).forEach(([timeStr, trackData]) => {
      const time = parseFloat(timeStr);
      if (!trackData?.vrmPose) return;
      const matrixArray = trackData?.vrmPose[boneName];

      if (matrixArray) {
        times.push(time);
        const matrix = new THREE.Matrix4().fromArray(matrixArray.matrix4);
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();

        matrix.decompose(position, quaternion, scale);
        positionTrackData.push(...position.toArray());
        quaternionTrackData.push(...quaternion.toArray());
        scaleTrackData.push(...scale.toArray());
      }
    });
    console.log(quaternionTrackData);
    if (quaternionTrackData.length) {
      tracks.push(
        new THREE.QuaternionKeyframeTrack(
          `${vrmNodeName}.quaternion`,
          times,
          quaternionTrackData,
        ),
      );
    }

    if (scaleTrackData.length) {
      tracks.push(
        new THREE.VectorKeyframeTrack(`${vrmNodeName}.scale`, times, scaleTrackData),
      );
    }
  });

  // matrixDataからすべての時間を取得
  const allTimes = Object.keys(matrixData).map(parseFloat);

  const maxTime = Math.max(...allTimes);

  return new THREE.AnimationClip('customMatrixAnimation', 0, tracks);
}
