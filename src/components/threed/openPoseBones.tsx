import * as THREE from 'three';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useSelector } from 'react-redux';
import {
  Color,
  Euler,
  Group,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from 'three';
import { Props, useFrame, useThree } from 'react-three-fiber';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import { RootState } from '../../store/create-store';
import { additionalOpenPosePoint } from '../../store/threed/figure-composer/slice';
import { FigureComposerListSelector } from '../../store/threed/figure-composer/selectors';
import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm';
import { Entasis } from './basic-geometry/Entasis';

type OpenPoseBoneHandle = {
  updateBoneImmediately: () => void;
  visibleBoneImmediately: () => void;
  hideBoneImmediately: () => void;
};
type OpenPoseBoneMeshLineProps = {
  uuid: string;
  targetBoneFirst: string;
  targetBoneNext: string;
  color: Color;
  targetVRM: VRM;
  enable: boolean;
};
const OpenPoseBoneMeshLine = forwardRef<OpenPoseBoneHandle, OpenPoseBoneMeshLineProps>(
  (
    props: {
      uuid: string;
      targetBoneFirst: string;
      targetBoneNext: string;
      color: Color;
      targetVRM: VRM;
      enable: boolean;
    },
    ref,
  ) => {
    const faceObjectName = 'Face';
    const meshRef = useRef<Mesh>(null);
    const startCubeRef = useRef<Mesh>(null);
    const endCubeRef = useRef<Mesh>(null);
    const boneGroupRef = useRef<Group>(null);
    const { size } = useThree();
    const [faceObject, setFaceObject] = useState<THREE.SkinnedMesh | undefined>();
    const startBone = props.targetVRM.humanoid.getRawBoneNode(
      props.targetBoneFirst as VRMHumanBoneName,
    );
    const endBone = props.targetVRM.humanoid.getRawBoneNode(
      props.targetBoneNext as VRMHumanBoneName,
    );
    const composerState = useSelector((state: RootState) => {
      return FigureComposerListSelector.getById(state, props.uuid) || null;
    });

    useEffect(() => {
      setFaceObject(
        props.targetVRM.scene.getObjectByName(faceObjectName) as THREE.SkinnedMesh,
      );
    }, []);

    useEffect(() => {
      if (!boneGroupRef.current) return;
      boneGroupRef.current.visible = props.enable;
    }, [props.enable]);

    const visibleBoneImmediately = () => {
      if (!boneGroupRef.current) return;
      boneGroupRef.current.visible = true;
    };
    const hideBoneImmediately = () => {
      if (!boneGroupRef.current) return;
      boneGroupRef.current.visible = false;
    };
    const updateBoneImmediately = () => {
      let startPosition = startBone?.getWorldPosition(new Vector3());
      let endPosition = endBone?.getWorldPosition(new Vector3());
      if (!faceObject) return;
      if (!startPosition) {
        const startTriangleIndex =
          facePoint[props.targetBoneFirst as additionalOpenPosePoint];
        if (startTriangleIndex) {
          startPosition = getMeshPosition(startTriangleIndex, faceObject);

          startPosition = startPosition ? startPosition : undefined;
        }
      }

      if (!endPosition) {
        const endTriangleIndex =
          facePoint[props.targetBoneNext as additionalOpenPosePoint];
        if (endTriangleIndex) {
          endPosition = getMeshPosition(endTriangleIndex, faceObject);
          endPosition = endPosition ? endPosition : undefined;
        }
      }
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
      meshRef.current.geometry.dispose();
      meshRef.current.geometry = line;
      meshRef.current.material = material;

      if (startCubeRef.current) startCubeRef.current.position.copy(startPosition);
      if (endCubeRef.current) endCubeRef.current.position.copy(endPosition);
    };

    useImperativeHandle(ref, () => ({
      updateBoneImmediately,
      visibleBoneImmediately,
      hideBoneImmediately,
    }));

    const facePoint = useMemo(() => {
      return {
        Lear: composerState.additionInfomationOpenPoseFace?.Lear?.x,
        Rear: composerState.additionInfomationOpenPoseFace?.Rear?.x,
        Leye: composerState.additionInfomationOpenPoseFace?.Leye?.x,
        Reye: composerState.additionInfomationOpenPoseFace?.Reye?.x,
        Nose: composerState.additionInfomationOpenPoseFace?.Nose?.x,
      };
    }, [
      composerState.additionInfomationOpenPoseFace?.Lear?.x,
      composerState.additionInfomationOpenPoseFace?.Rear?.x,
      composerState.additionInfomationOpenPoseFace?.Leye?.x,
      composerState.additionInfomationOpenPoseFace?.Reye?.x,
      composerState.additionInfomationOpenPoseFace?.Nose?.x,
    ]);

    /**
     * 頂点indexから、bone変換を考えた上で、頂点のワールド座標を返却する。
     * @param triangleIndex 頂点index
     * @param faceObj 対象のskinnedmeshオブジェクト
     * @returns THREE.Vector3 対応する頂点座標
     */
    const getMeshPosition = (triangleIndex: number, faceObj: THREE.SkinnedMesh) => {
      const geometry = faceObj.geometry;
      if (geometry instanceof THREE.BufferGeometry) {
        const positionAttribute = geometry.attributes.position;
        const skinIndices = geometry.attributes.skinIndex as THREE.BufferAttribute;
        const skinWeights = geometry.attributes.skinWeight as THREE.BufferAttribute;
        // ボーンインデックスとウェイトを取得
        const indices = new THREE.Vector4().fromBufferAttribute(
          skinIndices,
          triangleIndex,
        );
        const weights = new THREE.Vector4().fromBufferAttribute(
          skinWeights,
          triangleIndex,
        );
        const localPosition = new THREE.Vector3().fromBufferAttribute(
          positionAttribute as THREE.BufferAttribute,
          triangleIndex,
        );
        // ワールド座標系での頂点座標を計算
        const skinnedVertex = new THREE.Vector3();
        for (let i = 0; i < 4; ++i) {
          // ボーンの変換を取得
          const bone = faceObj.skeleton.bones[indices.getComponent(i)];
          const bindMatrix = faceObj.skeleton.boneInverses[indices.getComponent(i)];
          const boneMatrix = bone.matrixWorld;

          // 頂点座標に周りのボーンの逆変換、ボーンの変換とウェイトを適用
          const weightedVertex = new THREE.Vector3()
            .copy(localPosition)
            .applyMatrix4(bindMatrix)
            .applyMatrix4(boneMatrix)
            .multiplyScalar(weights.getComponent(i));

          // 加重平均を取る
          skinnedVertex.add(weightedVertex);
        }
        return skinnedVertex;
      }
    };

    useFrame(() => {
      updateBoneImmediately();
    });

    return (
      <group ref={boneGroupRef}>
        <mesh ref={meshRef}></mesh>
        <mesh ref={startCubeRef}>
          <sphereGeometry args={[0.02, 30, 30]} />
          <meshBasicMaterial color={props.color} />
        </mesh>
        <mesh ref={endCubeRef}>
          <sphereGeometry args={[0.02, 30, 30]} />
          <meshBasicMaterial color={props.color} />
        </mesh>
      </group>
    );
  },
);

// 今は使ってないが、将来的に入れ替えるために一旦置いている
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

export type OpenPoseBonesHandle = {
  updateBonesImmediately: () => void;
  visibleBonesImmediately: () => void;
  hideBonesImmediately: () => void;
};
type OpenPoseBonesProps = {
  uuid: string;
  targetVRM: VRM;
  enable: boolean;
  noseMeshNumber?: number;
  LEarMeshNumber?: number;
  REarMeshNumber?: number;
};

export const OpenPoseBones = forwardRef<OpenPoseBonesHandle, Props & OpenPoseBonesProps>(
  (
    props: {
      uuid: string;
      targetVRM: VRM;
      enable: boolean;
      noseMeshNumber?: number;
      LEarMeshNumber?: number;
      REarMeshNumber?: number;
    },
    ref,
  ) => {
    const boneRefs = useRef<Array<any>>([]);
    useImperativeHandle(ref, () => ({
      updateBonesImmediately: () => {
        boneRefs.current.forEach(ref => {
          if (ref) {
            ref.updateBoneImmediately();
          }
        });
      },
      visibleBonesImmediately: () => {
        boneRefs.current.forEach(ref => {
          if (ref) {
            ref.visibleBoneImmediately();
          }
        });
      },
      hideBonesImmediately: () => {
        boneRefs.current.forEach(ref => {
          if (ref) {
            ref.hideBoneImmediately();
          }
        });
      },
    }));

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
    }, [...props.targetVRM.scene.position.toArray()]);

    return (
      <>
        <group position={position} rotation={props.targetVRM.scene.rotation}>
          {joinMap.map((boneInfo, index) => {
            return (
              <OpenPoseBoneMeshLine
                ref={(el: any) => (boneRefs.current[index] = el)}
                uuid={props.uuid}
                enable={props.enable}
                targetBoneFirst={boneInfo.first}
                targetBoneNext={boneInfo.second}
                targetVRM={props.targetVRM}
                color={boneInfo.color}></OpenPoseBoneMeshLine>
            );
          })}
        </group>
      </>
    );
  },
);
