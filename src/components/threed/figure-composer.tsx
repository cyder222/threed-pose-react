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
import { Group, Material, MeshBasicMaterial, MeshDepthMaterial } from 'three';
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
import { isFlagSet } from '../../util/calculation';
import { renderStateSelector } from '../../store/threed/camera/selector';
import { ModelRenderStateEnum } from '../../store/threed/camera/slice';
import { outlineMaterial } from './materials/outline-material/outline-material';
import { simpleColorMaterial } from './materials/simple-color-material/simple-color-material';

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

  const modelRenderState = useSelector((state: RootState) => {
    return renderStateSelector.getModelRenderState(state);
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
            matrix4: boneNode.matrix.toArray(),
          };
          boneState[name] = pose;
        }

        return boneState;
      };

      const vrmPose = getBoneMap(loadedVrm);

      dispatch(FigureComposerSlice.actions.setVRMPose({ id: props.uuid, pose: vrmPose }));
      // Materialのデータを保存

      setLoading(false);

      // 色を変えるために、現在のMaterialデータをUserDataに保存
      loadedVrm.scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.userData.isVrmModel = true;

          if (Array.isArray(obj.material)) {
            obj.userData.originalMaterial = obj.material.map(
              (material: MToonMaterial | MeshBasicMaterial) => {
                return material.clone();
              },
            );
            obj.userData.selectedMaterial = obj.material.map(
              (material: MToonMaterial | MeshBasicMaterial) => {
                if (material instanceof MToonMaterial) {
                  // MToonMaterialの場合
                  const newMat = material.clone();
                  newMat.uniforms.emissive.value.set(0x0000ff);
                  return newMat;
                } else {
                  // MeshStandardMaterialやMeshBasicMaterialの場合
                  const newMat = material.clone();
                  newMat.color?.set?.(0x0000ff);
                  return newMat;
                }
              },
            );
          } else {
            obj.userData.originalMaterial = obj.material.clone();
          }
        }
      });
    },
  );

  // hover時、select時に見た目を変更する
  useEffect(() => {
    const setMaterialColor = (material: unknown) => {
      if (material instanceof MToonMaterial) {
        // MToonMaterialの場合
        material.uniforms.emissive.value.set(0x0000ff);
        return;
      } else {
        // MeshStandardMaterialやMeshBasicMaterialの場合
        const mat = material as any;
        mat.color?.set?.(0x0000ff);
        return;
      }
    };
    const setMaterial = (obj: THREE.Mesh, hover: boolean) => {
      if (!obj.userData.isVrmModel) return;

      let nextMat =
        composerState.composerSelectState === ComposerSelectState.selected
          ? obj.userData.selectedMaterial
          : obj.userData.originalMaterial;
      obj.material = nextMat;

      let advancedMat: Material | null | Array<Material> = null;
      if (isFlagSet(modelRenderState, ModelRenderStateEnum.renderDepth)) {
        advancedMat = new MeshDepthMaterial();
      }
      if (isFlagSet(modelRenderState, ModelRenderStateEnum.renderOutline)) {
        advancedMat = [simpleColorMaterial, outlineMaterial];
      }

      if (advancedMat != null) {
        if (Array.isArray(obj.material)) {
          if (!Array.isArray(advancedMat)) {
            obj.material = obj.material.map(material => {
              return advancedMat! as Material;
            });
          } else {
            obj.material = advancedMat;
          }
        } else {
          obj.material = advancedMat!;
        }
      }
    };

    vrm?.scene?.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        setMaterial(obj, hovered);
      }
    });
  }, [composerState.composerSelectState, modelRenderState]);

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
        <group
          ref={meshRef}
          visible={isFlagSet(modelRenderState, ModelRenderStateEnum.renderVRM)}>
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
        ) (vrm &&
        <OpenPoseBones
          enable={isFlagSet(modelRenderState, ModelRenderStateEnum.renderPoseBone)}
          uuid={props.uuid}
          targetVRM={vrm}></OpenPoseBones>
        )
      </group>
    )) || <></>
  );
};

export default FigureComposer;
