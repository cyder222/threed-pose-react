import { TransformControls } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box3, Group, Object3D, Vector3 } from 'three';
import { RootState } from '../../store/create-store';
import FigureComposerSlice, {
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

const BoneManupilator = (props: {
  uuid: string;
  targetBoneName: string;
  targetBone: Object3D;
  enable: boolean;
  onUpdateBone?: () => void;
}) => {
  const tool = useSelector((state: RootState) => {
    return toolSelector.getCurrent(state);
  });
  const manupilatorRef = useRef<Group>(null);
  const composerState = useSelector((state: RootState) => {
    return FigureComposerListSelector.getById(state, props.uuid) || null;
  });
  const isSelected = useMemo(() => {
    return (
      composerState.vrmState.vrmBoneSelectState[props.targetBoneName] ===
      BoneSelectState.selected
    );
  }, [composerState.vrmState.vrmBoneSelectState[props.targetBoneName]]);

  const manupilatorObjSize = useMemo(() => {
    const box = new Box3().setFromObject(props.targetBone);
    const size = box.getSize(new Vector3());

    console.log('minimum=' + Math.min.apply(null, [size.x, size.y, size.z]));

    return Math.min.apply(null, [size.x, size.y, size.z]);
  }, [props.targetBone]);

  const objectToolHandler = useObjectToolHandler();
  let mouseUpOnTransform = true;

  const getControlType = useMemo(() => {
    if (tool.tool.matches('pose_target_move')) {
      return 'translate';
    } else if (
      tool.tool.matches({
        target_selected: { pose: { pose_target_selected: 'pose_target_rotate' } },
      })
    ) {
      return 'rotate';
    } else if (tool.tool.matches({ pose_target_selected: 'pose_target_scale' })) {
      return 'scale';
    } else {
      return '';
    }
  }, [tool.tool]);

  // 有効無効に応じて、manupiratorをboneに加えるかどうか変更する
  useEffect(() => {
    if (!manupilatorRef.current) return;

    if (props.enable) {
      props.targetBone.add(manupilatorRef.current);
    } else {
      props.targetBone.remove(manupilatorRef.current);
    }
  }, [props.enable, manupilatorRef.current, props.targetBone]);
  return (
    <>
      {getControlType !== '' && isSelected && (
        <TransformControls
          mode={getControlType}
          object={props.targetBone || undefined}
          onChange={() => {
            props.onUpdateBone?.();
          }}
          size={0.3}
          onMouseDown={(event: THREE.Event | undefined) => {
            mouseUpOnTransform = false;
            objectToolHandler.sceneEditToolBoneControlHandlers?.onMouseDown?.(
              props.uuid,
              props.targetBoneName,
            );
          }}
          onMouseUp={(event: THREE.Event | undefined) => {
            mouseUpOnTransform = true;
            objectToolHandler.sceneEditToolBoneControlHandlers?.onMouseUp?.(
              props.uuid,
              props.targetBoneName,
            );
          }}
          raycast={(_raycaster, intersects) => {
            // 直接マウスが下げられてない時、このオブジェクトは無視する
            // 空の領域をタップしても、このオブジェクトがレイキャストに引っかかるので対策
            if (mouseUpOnTransform) intersects.length = 0;
          }}></TransformControls>
      )}
      <group ref={manupilatorRef} scale={new Vector3(0.01, 0.01, 0.01)}>
        <mesh
          scale={[1, 1, 1]}
          onPointerDown={(event: ThreeEvent<PointerEvent> | undefined) => {
            objectToolHandler.sceneEditToolBoneControlHandlers?.onMouseDown?.(
              props.uuid,
              props.targetBoneName,
            );
          }}
          onPointerUp={(event: ThreeEvent<PointerEvent> | undefined) => {
            objectToolHandler.sceneEditToolBoneControlHandlers?.onMouseUp?.(
              props.uuid,
              props.targetBoneName,
            );
          }}>
          <sphereBufferGeometry attach='geometry' args={[1, 30, 30]} />
          <meshBasicMaterial
            depthTest={false}
            transparent={true}
            opacity={0.5}
            color={'red'}
            userData={{ originalColor: 'white' }}></meshBasicMaterial>
        </mesh>
      </group>
    </>
  );
};

export const BoneManupilators = (props: {
  uuid: string;
  targetVRM: VRM;
  enable: boolean;
}) => {
  const composerState = useSelector((state: RootState) => {
    return FigureComposerListSelector.getById(state, props.uuid) || null;
  });
  const humanoid = props.targetVRM.humanoid;
  const dispatch = useDispatch();

  for (const boneName in VRMHumanBoneName) {
    const humanBoneName = camelcase(boneName) as VRMHumanBoneName;
    const matrixOfBone = humanoid.getNormalizedBoneNode(humanBoneName)?.matrix?.toArray();
    // threejs側のbone位置が変更された時に、store側にも反映させる
    useEffect(() => {
      const bone = humanoid.getNormalizedBoneNode(humanBoneName);
      if (!bone) return;
      const poseState: VRMPoseState = {
        humanBoneName: {
          position: serializeVector3(bone.position),
          rotation: serializeEuler(bone.rotation),
          scale: serializeVector3(bone.scale),
        },
      };
      dispatch(
        FigureComposerSlice.actions.setVRMPose({ id: props.uuid, pose: poseState }),
      );
    }, [...(matrixOfBone != null ? matrixOfBone : [])]);

    /* store側のbone情報が更新された時に、threejs側も移動させる
    useEffect(() => {
      const position = composerState.vrmState.vrmPose[humanBoneName].position;
      const rotation = composerState.vrmState.vrmPose[humanBoneName].rotation;
      const scale = composerState.vrmState.vrmPose[humanBoneName].scale;

      humanoid
        .getNormalizedBoneNode(humanBoneName)
        ?.position.set(position.x, position.y, position.z);
      humanoid
        .getNormalizedBoneNode(humanBoneName)
        ?.rotation.set(rotation.x, rotation.y, rotation.z, rotation.order);
      humanoid.getNormalizedBoneNode(humanBoneName)?.scale.set(scale.x, scale.y, scale.z);
    }, [
      Object.hasOwn(composerState.vrmState.vrmPose, humanBoneName),
      ...Object.values(composerState.vrmState.vrmPose[humanBoneName].position),
      ...Object.values(composerState.vrmState.vrmPose[humanBoneName].rotation),
      ...Object.values(composerState.vrmState.vrmPose[humanBoneName].scale),
    ]);
    */
  }

  return (
    <>
      {Object.keys(composerState.vrmState.vrmPose).map(boneKey => {
        const targetBone = props.targetVRM.humanoid.getNormalizedBoneNode(
          boneKey as VRMHumanBoneName,
        );
        if (targetBone == null) return;
        return (
          <BoneManupilator
            uuid={props.uuid}
            targetBoneName={boneKey}
            targetBone={targetBone}
            enable={props.enable}
            onUpdateBone={() => {
              props.targetVRM.humanoid.update();
            }}></BoneManupilator>
        );
      })}
    </>
  );
};