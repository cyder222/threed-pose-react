import React, { useEffect, useMemo, useRef, useState } from 'react';
import useVRM from '../../hooks/use-vrm-hooks';
import { ThreeEvent } from '@react-three/fiber';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/create-store';
import { TransformControls, useTexture } from '@react-three/drei';
import { FigureComposerListSelector } from '../../store/threed/figure-composer/selectors';
import FigureComposerSlice, {
  composerRenderState,
  ComposerSelectState,
  VRMPoseNodeState,
  VRMPoseState,
} from '../../store/threed/figure-composer/slice';
import useObjectToolHandler from '../../hooks/tools/use-scene-edit-tool';
import { toolSelector } from '../../store/threed/tool/selectors';
import * as THREE from 'three';
import { MToonMaterial, VRM, VRMHumanBoneName } from '@pixiv/three-vrm';
import { Group } from 'three';
import {
  deserializeEuler,
  deserializeVector3,
  serializeEuler,
  serializeVector3,
} from '../../util/store/three-seiralize';
import figureComposerSlice from '../../store/threed/figure-composer/slice';
import { BoneManupilators } from './boneManupilators';
import camelcase from 'camelcase';
import { OpenPoseBones } from './openPoseBones';
import { depthMaterial } from './materials/depth-material/depth-material';

const FigureComposer = (
  props: { uuid: string } & {
    vrmRef: React.RefObject<VRM>;
  },
) => {
  const url = useSelector((state: RootState) => {
    return FigureComposerListSelector.getFileUrlById(state, props.uuid) || null;
  });
  const composerState = useSelector((state: RootState) => {
    return FigureComposerListSelector.getById(state, props.uuid) || null;
  });
  const objectToolHandler = useObjectToolHandler();
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(false);
  const vrmRef = useRef<VRM>(null);
  const meshRef = useRef<Group>(null);
  const dispatch = useDispatch();

  const tool = useSelector((state: RootState) => {
    return toolSelector.getCurrent(state);
  });

  // store側の位置情報が更新された時に、表示側も移動させる
  useEffect(() => {
    if (!meshRef?.current) {
      return;
    }
    const newPosition = deserializeVector3(composerState.vrmState.translate);
    const newScale = deserializeVector3(composerState.vrmState.scale);
    const newRotation = deserializeEuler(composerState.vrmState.rotation);

    meshRef.current.position.equals(newPosition) &&
      meshRef.current.position.copy(newPosition);

    meshRef.current.scale.equals(newScale) && meshRef.current.scale.copy(newScale);

    meshRef.current.rotation.equals(newRotation) &&
      meshRef.current.rotation.copy(newRotation);
  }, [
    composerState.vrmState.translate,
    composerState.vrmState.rotation,
    composerState.vrmState.scale,
  ]);

  // vrmの場所をthreejsの機能で移動した時に、storeもあわせる
  useEffect(() => {
    if (!meshRef?.current) {
      return;
    }
    const newPosition = meshRef?.current?.position;
    const newScale = meshRef?.current?.scale;
    const newRotation = meshRef?.current?.rotation;
    const oldPosition = deserializeVector3(composerState.vrmState.translate);
    const oldScale = deserializeVector3(composerState.vrmState.scale);
    const oldRotation = deserializeEuler(composerState.vrmState.rotation);
    if (!newPosition.equals(oldPosition)) {
      dispatch(
        figureComposerSlice.actions.translateComposer({
          id: props.uuid,
          translateTo: newPosition.clone(),
        }),
      );
    }
    if (!newScale.equals(oldScale)) {
      dispatch(
        figureComposerSlice.actions.scaleComposer({
          id: props.uuid,
          scaleTo: newScale.clone(),
        }),
      );
    }
    if (!newRotation.equals(oldRotation)) {
      dispatch(
        figureComposerSlice.actions.rotateComposer({
          id: props.uuid,
          rotateTo: newRotation.clone(),
        }),
      );
    }
  }, [
    meshRef?.current?.position.x,
    meshRef?.current?.position.y,
    meshRef?.current?.position.z,
    meshRef?.current?.scale.x,
    meshRef?.current?.scale.y,
    meshRef?.current?.scale.z,
    meshRef?.current?.rotation.x,
    meshRef?.current?.rotation.y,
    meshRef?.current?.rotation.z,
  ]);

  const vrm = useVRM(
    url,
    e => {
      console.log((e.loaded / e.total) * 100 + '%');
    },
    loadedVrm => {
      // Pose情報をRedux Storeに入れる
      const getBoneMap = (targetVRM: VRM) => {
        const boneState: VRMPoseState = {};
        for (const boneName in VRMHumanBoneName) {
          const name = camelcase(boneName) as VRMHumanBoneName;
          console.log('name is ' + name);
          const boneNode = targetVRM.humanoid.getNormalizedBoneNode(name);
          console.log('boneNode name is ' + boneNode?.name);
          if (boneNode == null) {
            console.log(`bone name ${name} is null`);
            continue;
          }
          const pose: VRMPoseNodeState = {
            position: serializeVector3(boneNode.position),
            scale: serializeVector3(boneNode.scale),
            rotation: serializeEuler(boneNode.rotation),
          };
          boneState[name] = pose;
        }

        return boneState;
      };

      const vrmPose = getBoneMap(loadedVrm);
      console.log(vrmPose);
      dispatch(FigureComposerSlice.actions.setVRMPose({ id: props.uuid, pose: vrmPose }));
      // Materialのデータを保存
      const setMaterialUserData = (obj: THREE.Mesh, material: unknown) => {
        if (obj.userData.originalColor == null)
          obj.userData.originalColor = new Array<THREE.Color>();
        if (material instanceof MToonMaterial) {
          // MToonMaterialの場合
          obj.userData.originalColor[material.uuid] =
            material.uniforms.emissive.value.clone();
        } else {
          // MeshStandardMaterialやMeshBasicMaterialの場合
          const mat = material as THREE.MeshBasicMaterial;
          obj.userData.originalColor[mat.uuid] = mat.color.clone();
        }
      };
      setLoading(false);

      // 色を変えるために、現在のMaterialデータをUserDataに保存
      loadedVrm.scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.userData.isVrmModel = true;
          if (Array.isArray(obj.material)) {
            obj.material.forEach((material: unknown) => {
              setMaterialUserData(obj, material);
            });
          } else {
            setMaterialUserData(obj, obj.material);
          }
        }
      });
    },
  );

  const vrmBoundingBox = useMemo(() => {
    return vrm ? new THREE.Box3Helper(new THREE.Box3().setFromObject(vrm.scene)) : null;
  }, [vrm]);

  // hover時、select時に見た目を変更する
  useEffect(() => {
    const newMat = new THREE.MeshDepthMaterial();
    const setMaterial = (obj: THREE.Mesh, hover: boolean) => {
      if (!obj.userData.isVrmModel) return;

      if (composerState.composerSelectState === ComposerSelectState.selected) {
        if (Array.isArray(obj.material)) {
          obj.material = obj.material.map(() => newMat);
        } else {
          obj.material = newMat;
        }
        return;
      }
    };

    vrm?.scene?.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        setMaterial(obj, hovered);
      }
    });
  }, [hovered, composerState.composerSelectState]);

  const getControlType = useMemo(() => {
    if (tool.tool.matches({ target_selected: 'move' })) {
      return 'translate';
    } else if (tool.tool.matches({ target_selected: 'rotate' })) {
      return 'rotate';
    } else if (tool.tool.matches({ target_selected: 'scale' })) {
      return 'scale';
    } else {
      return '';
    }
  }, [tool.tool]);

  const isRenderBoneManupilator = useMemo(() => {
    if (tool.tool.matches({ target_selected: 'pose' })) {
      return true;
    } else {
      return false;
    }
  }, [tool.tool]);

  // 即時反応が欲しいので、stateにしてない
  let mouseUpOnTransform = true;
  return (
    (!loading && vrm && (
      <group>
        {getControlType !== '' && (
          <TransformControls
            mode={getControlType}
            object={meshRef.current || undefined}
            onMouseDown={(event: THREE.Event | undefined) => {
              mouseUpOnTransform = false;
              objectToolHandler.figureComposerHandlers?.onMouseDown?.(props.uuid, event);
            }}
            onMouseUp={(event: THREE.Event | undefined) => {
              mouseUpOnTransform = true;
              objectToolHandler.figureComposerHandlers?.onMouseUp?.(props.uuid, event);
            }}
            raycast={(_raycaster, intersects) => {
              // 直接マウスが下げられてない時、このオブジェクトは無視する
              // 空の領域をタップしても、このオブジェクトがレイキャストに引っかかるので対策
              if (mouseUpOnTransform) intersects.length = 0;
            }}></TransformControls>
        )}
        <group ref={meshRef} visible={!tool.tool.matches('target_selecting')}>
          <primitive
            object={vrm.scene}
            ref={vrmRef}
            onPointerDown={(event: ThreeEvent<PointerEvent> | undefined) => {
              objectToolHandler.figureComposerHandlers?.onMouseDown?.(props.uuid, event);
            }}
            onPointerUp={(event: ThreeEvent<PointerEvent> | undefined) => {
              objectToolHandler.figureComposerHandlers?.onMouseUp?.(props.uuid, event);
            }}
          />
        </group>
        (vrm &&
        <BoneManupilators
          uuid={props.uuid}
          targetVRM={vrm}
          enable={isRenderBoneManupilator}></BoneManupilators>
        ) (vrm && tool.tool.matches('target_selecting') &&
        <OpenPoseBones uuid={props.uuid} targetVRM={vrm}></OpenPoseBones>)
      </group>
    )) || <></>
  );
};

export default FigureComposer;
