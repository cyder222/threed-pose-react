import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { KeyTrackEntity } from '../../store/threed/keytrack/slice';

/**
 * Mixamoのリグ名をVRMのHumanoidボーン名に変換する
 */
const mixamoVRMRigMap: Record<string, string> = {
  mixamorigHips: 'hips',
  mixamorigSpine: 'spine',
  mixamorigSpine1: 'chest',
  mixamorigSpine2: 'upperChest',
  mixamorigNeck: 'neck',
  mixamorigHead: 'head',
  mixamorigLeftShoulder: 'leftShoulder',
  mixamorigLeftArm: 'leftUpperArm',
  mixamorigLeftForeArm: 'leftLowerArm',
  mixamorigLeftHand: 'leftHand',
  mixamorigLeftHandThumb1: 'leftThumbProximal',
  mixamorigLeftHandThumb2: 'leftThumbIntermediate',
  mixamorigLeftHandThumb3: 'leftThumbDistal',
  mixamorigLeftHandIndex1: 'leftIndexProximal',
  mixamorigLeftHandIndex2: 'leftIndexIntermediate',
  mixamorigLeftHandIndex3: 'leftIndexDistal',
  mixamorigLeftHandMiddle1: 'leftMiddleProximal',
  mixamorigLeftHandMiddle2: 'leftMiddleIntermediate',
  mixamorigLeftHandMiddle3: 'leftMiddleDistal',
  mixamorigLeftHandRing1: 'leftRingProximal',
  mixamorigLeftHandRing2: 'leftRingIntermediate',
  mixamorigLeftHandRing3: 'leftRingDistal',
  mixamorigLeftHandPinky1: 'leftLittleProximal',
  mixamorigLeftHandPinky2: 'leftLittleIntermediate',
  mixamorigLeftHandPinky3: 'leftLittleDistal',
  mixamorigRightShoulder: 'rightShoulder',
  mixamorigRightArm: 'rightUpperArm',
  mixamorigRightForeArm: 'rightLowerArm',
  mixamorigRightHand: 'rightHand',
  mixamorigRightHandPinky1: 'rightLittleProximal',
  mixamorigRightHandPinky2: 'rightLittleIntermediate',
  mixamorigRightHandPinky3: 'rightLittleDistal',
  mixamorigRightHandRing1: 'rightRingProximal',
  mixamorigRightHandRing2: 'rightRingIntermediate',
  mixamorigRightHandRing3: 'rightRingDistal',
  mixamorigRightHandMiddle1: 'rightMiddleProximal',
  mixamorigRightHandMiddle2: 'rightMiddleIntermediate',
  mixamorigRightHandMiddle3: 'rightMiddleDistal',
  mixamorigRightHandIndex1: 'rightIndexProximal',
  mixamorigRightHandIndex2: 'rightIndexIntermediate',
  mixamorigRightHandIndex3: 'rightIndexDistal',
  mixamorigRightHandThumb1: 'rightThumbProximal',
  mixamorigRightHandThumb2: 'rightThumbIntermediate',
  mixamorigRightHandThumb3: 'rightThumbDistal',
  mixamorigLeftUpLeg: 'leftUpperLeg',
  mixamorigLeftLeg: 'leftLowerLeg',
  mixamorigLeftFoot: 'leftFoot',
  mixamorigLeftToeBase: 'leftToes',
  mixamorigRightUpLeg: 'rightUpperLeg',
  mixamorigRightLeg: 'rightLowerLeg',
  mixamorigRightFoot: 'rightFoot',
  mixamorigRightToeBase: 'rightToes',
};

/**
 * Mixamoのアニメーションを読み込み、VRM向けに調整して返す
 * @param {string} url Mixamoのモーションが入ったURL
 * @returns {Promise<THREE.AnimationClip>} AnimationClip
 * @throws {Error} ファイルのロード失敗時、
 */ export async function loadMixamoAnimation(url: string): Promise<KeyTrackEntity> {
  const loader = new FBXLoader();
  let asset: any;
  try {
    asset = await loader.loadAsync(url);
  } catch (error) {
    throw new Error('Failed to load the FBX file. It might not be a valid file.');
  }

  const clip = THREE.AnimationClip.findByName(asset.animations, 'mixamo.com');

  if (!clip) {
    throw new Error('The provided FBX file does not appear to be from Mixamo.');
  }

  const keyTrackEntity: KeyTrackEntity = {};

  clip.tracks.forEach(track => {
    const trackSplitted = track.name.split('.');
    const mixamoRigName = trackSplitted[0];
    const vrmBoneName = mixamoVRMRigMap[mixamoRigName] as VRMHumanBoneName;

    track.times.forEach((time, index) => {
      const matrix =
        keyTrackEntity[time] &&
        keyTrackEntity[time]?.vrmPose[vrmBoneName] &&
        keyTrackEntity[time]?.vrmPose[vrmBoneName].matrix4
          ? new THREE.Matrix4().fromArray(
              keyTrackEntity[time]?.vrmPose[vrmBoneName].matrix4!,
            )
          : new THREE.Matrix4();
      const valueStartIdx = track.getValueSize() * index;
      const values = track.values.slice(
        valueStartIdx,
        valueStartIdx + track.getValueSize(),
      );

      if (track instanceof THREE.QuaternionKeyframeTrack) {
        const quaternion = new THREE.Quaternion().fromArray(values);
        matrix.makeRotationFromQuaternion(quaternion);
      } else if (track.name.includes('.position')) {
        const position = new THREE.Vector3().fromArray(values);
        matrix.setPosition(position);
      } else if (track.name.includes('.scale')) {
        const scale = new THREE.Vector3().fromArray(values);
        matrix.scale(scale);
      }

      if (!keyTrackEntity[time]) {
        keyTrackEntity[time] = {
          currentTargetTransform: { matrix4: [] },
          vrmPose: {},
        };
      }

      //keyTrackEntity[time]!.currentTargetTransform.matrix4 = matrix.toArray();
      keyTrackEntity[time]!.vrmPose[vrmBoneName] = { matrix4: matrix.toArray() };
    });
  });

  return keyTrackEntity;
}
