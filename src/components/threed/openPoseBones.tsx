import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box3,
  BufferGeometry,
  Color,
  Euler,
  Group,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  Vector3,
} from 'three';
import { extend, useThree } from 'react-three-fiber';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import { RootState } from '../../store/create-store';
import FigureComposerSlice, {
  AdditionalInfomationOpenPoseFace,
  additionalOpenPosePoint,
  BoneSelectState,
  composerRenderState,
  ComposerSelectState,
  VRMPoseNodeState,
  VRMPoseState,
} from '../../store/threed/figure-composer/slice';
import { FigureComposerListSelector } from '../../store/threed/figure-composer/selectors';
import useObjectToolHandler from '../../hooks/tools/use-scene-edit-tool';
import {
  deserializeEuler,
  deserializeVector3,
  serializeEuler,
  serializeVector3,
} from '../../util/store/three-seiralize';
import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm';
import { toolSelector } from '../../store/threed/tool/selectors';
import camelcase from 'camelcase';
import { ThreeEvent } from 'react-three-fiber';
import { Entasis } from './basic-geometry/Entasis';

const OpenPoseBoneMeshLine = (props: {
  uuid: string;
  targetBoneFirst: string;
  targetBoneNext: string;
  color: Color;
  targetVRM: VRM;
}) => {
  const meshRef = useRef<Mesh>(null);
  const { size } = useThree();
  const startBone = props.targetVRM.humanoid.getRawBoneNode(
    props.targetBoneFirst as VRMHumanBoneName,
  );
  const endBone = props.targetVRM.humanoid.getRawBoneNode(
    props.targetBoneNext as VRMHumanBoneName,
  );

  useEffect(() => {
    const startPosition = startBone?.getWorldPosition(new Vector3());
    const endPosition = endBone?.getWorldPosition(new Vector3());
    if (!startPosition || !endPosition) return;
    const points = [startPosition, endPosition];
    const line = new MeshLineGeometry();
    line.setPoints(points);
    const material = new MeshLineMaterial({
      lineWidth: 0.05,
      color: props.color,
      resolution: new THREE.Vector2(size.width, size.height),
    });
    if (!meshRef.current) return;
    meshRef.current.geometry = line;
    meshRef.current.material = material;
  }, [
    meshRef.current,
    ...(startBone?.getWorldPosition(new Vector3()).toArray() || []),
    ...(endBone?.getWorldPosition(new Vector3()).toArray() || []),
  ]);

  return (
    <>
      <mesh ref={meshRef}></mesh>
      <mesh position={startBone?.getWorldPosition(new Vector3())}>
        <sphereGeometry args={[0.02, 30, 30]} />
        <meshBasicMaterial color={props.color} />
      </mesh>
      <mesh position={endBone?.getWorldPosition(new Vector3())}>
        <sphereGeometry args={[0.02, 30, 30]} />
        <meshBasicMaterial color={props.color} />
      </mesh>
    </>
  );
};

const OpenPoseBone = (props: {
  uuid: string;
  targetBoneFirst: string;
  targetBoneNext: string;
  color: Color;
  targetVRM: VRM;
}) => {
  const startBone = props.targetVRM.humanoid.getRawBoneNode(
    props.targetBoneFirst as VRMHumanBoneName,
  );
  const endBone = props.targetVRM.humanoid.getRawBoneNode(
    props.targetBoneNext as VRMHumanBoneName,
  );

  const meshRef = useRef<Mesh>(null);

  const [length, setLength] = useState<number>(1);

  useEffect(() => {
    if (!meshRef.current) return;
    if (!startBone || !endBone) return;
    const startPosition = startBone.getWorldPosition(new Vector3());
    const endPosition = endBone.getWorldPosition(new Vector3());
    setLength(startPosition.distanceTo(endPosition));
  }, [
    ...(startBone?.position?.toArray() || []),
    ...(endBone?.position?.toArray() || []),
    meshRef.current,
  ]);

  useEffect(() => {
    if (!meshRef.current) return;
    if (!startBone || !endBone) return;
    const startPosition = startBone.getWorldPosition(new Vector3());
    const endPosition = endBone.getWorldPosition(new Vector3());
    //meshRef.current.rotation.copy(rotate);
    meshRef.current.position.copy(
      startPosition.subVectors(
        startPosition,
        new Vector3().subVectors(startPosition, endPosition).divideScalar(2),
      ),
    );
    const rotate = new Euler().setFromQuaternion(
      new Quaternion().setFromUnitVectors(
        startPosition.normalize(),
        new Vector3().subVectors(startPosition, endPosition).divideScalar(2).normalize(),
      ),
    );
    meshRef.current.rotation.copy(rotate);
  }, [
    length,
    meshRef.current,
    ...(startBone?.position?.toArray() || []),
    ...(endBone?.position?.toArray() || []),
  ]);

  const material = new MeshStandardMaterial();
  material.color = new Color(0xaaa);
  return startBone && endBone ? (
    <mesh
      ref={meshRef}
      onClick={() => {
        console.log(props.targetBoneFirst);
        console.log(props.targetBoneNext);
      }}>
      <Entasis
        height={length}
        radiusTop={0.01}
        radiusBottom={0.01}
        openEnded={false}
        material={material}></Entasis>
    </mesh>
  ) : (
    <></>
  );
};

export const OpenPoseBones = (props: {
  uuid: string;
  targetVRM: VRM;
  noseMeshNumber?: number;
  LEarMeshNumber?: number;
  REarMeshNumber?: number;
}) => {
  const joinMap: {
    first: VRMHumanBoneName | additionalOpenPosePoint;
    second: VRMHumanBoneName | additionalOpenPosePoint;
    color: Color;
  }[] = [
    {
      first: VRMHumanBoneName.LeftUpperLeg,
      second: VRMHumanBoneName.LeftLowerLeg,
      color: new Color(0x2a6495),
    },
    {
      first: VRMHumanBoneName.LeftLowerLeg,
      second: VRMHumanBoneName.LeftFoot,
      color: new Color(0x113193),
    },
    {
      first: VRMHumanBoneName.RightUpperLeg,
      second: VRMHumanBoneName.RightLowerLeg,
      color: new Color(0x439741),
    },
    {
      first: VRMHumanBoneName.RightLowerLeg,
      second: VRMHumanBoneName.RightFoot,
      color: new Color(0x43976a),
    },
    {
      first: VRMHumanBoneName.Neck,
      second: VRMHumanBoneName.RightUpperLeg,
      color: new Color(0x43972a),
    },
    {
      first: VRMHumanBoneName.Neck,
      second: VRMHumanBoneName.LeftUpperLeg,
      color: new Color(0x439798),
    },
    {
      first: VRMHumanBoneName.Neck,
      second: VRMHumanBoneName.RightUpperArm,
      color: new Color(0x8c1a11),
    },
    {
      first: VRMHumanBoneName.RightUpperArm,
      second: VRMHumanBoneName.RightLowerArm,
      color: new Color(0x926821),
    },
    {
      first: VRMHumanBoneName.RightLowerArm,
      second: VRMHumanBoneName.RightHand,
      color: new Color(0x99992f),
    },
    {
      first: VRMHumanBoneName.Neck,
      second: VRMHumanBoneName.LeftUpperArm,
      color: new Color(0x8d3915),
    },
    {
      first: VRMHumanBoneName.LeftUpperArm,
      second: VRMHumanBoneName.LeftLowerArm,
      color: new Color(0x71982c),
    },
    {
      first: VRMHumanBoneName.LeftLowerArm,
      second: VRMHumanBoneName.LeftHand,
      color: new Color(0x51972a),
    },
    { first: VRMHumanBoneName.Neck, second: 'Nose', color: new Color(0x000093) },
    { first: 'Nose', second: 'Leye', color: new Color(0x8d1c96) },
    { first: 'Leye', second: 'Lear', color: new Color(0x8d1b64) },
    { first: 'Nose', second: 'Reye', color: new Color(0x2d0393) },
    { first: 'Reye', second: 'Rear', color: new Color(0x5d0f94) },
  ];

  const [position, setPosition] = useState(new THREE.Vector3());
  useEffect(() => {
    setPosition(props.targetVRM.scene.position);
    console.log('use Effect');
  }, [...props.targetVRM.scene.position.toArray()]);
  return (
    <>
      <group position={position} rotation={props.targetVRM.scene.rotation}>
        {joinMap.map(boneInfo => {
          return (
            <OpenPoseBoneMeshLine
              uuid={props.uuid}
              targetBoneFirst={boneInfo.first}
              targetBoneNext={boneInfo.second}
              targetVRM={props.targetVRM}
              color={boneInfo.color}></OpenPoseBoneMeshLine>
          );
        })}
      </group>
    </>
  );
};
