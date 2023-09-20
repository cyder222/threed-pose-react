import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import useVRM from '../../hooks/use-vrm-hooks';
import { ThreeEvent } from '@react-three/fiber';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/create-store';
import { TransformControls, useTexture } from '@react-three/drei';
import { FigureComposerListSelector } from '../../store/threed/figure-composer/selectors';
import FigureComposerSlice, {
  composerRenderState,
  ComposerSelectState,
  PlayMode,
  VRMPoseNodeState,
  VRMPoseState,
} from '../../store/threed/figure-composer/slice';
import { animationPlaybackSlice } from '../../store/threed/animation-playback/slice';
import { FigureComposerAnimationPlaybackSelector } from '../../store/threed/animation-playback/selector';
import useObjectToolHandler from '../../hooks/tools/use-scene-edit-tool';
import { toolSelector } from '../../store/threed/tool/selectors';
import * as THREE from 'three';
import { MToonMaterial, VRM, VRMHumanBoneName } from '@pixiv/three-vrm';
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Group,
  Material,
  Matrix4,
  MeshBasicMaterial,
  MeshDepthMaterial,
} from 'three';
import {
  deserializeEuler,
  deserializeVector3,
  serializeEuler,
  serializeVector3,
} from '../../util/store/three-seiralize';
import figureComposerSlice from '../../store/threed/figure-composer/slice';
import { BoneManupilators } from './boneManupilators';
import camelcase from 'camelcase';
import { OpenPoseBones, OpenPoseBonesHandle } from './openPoseBones';
import { depthMaterial } from './materials/depth-material/depth-material';
import { extractTransform } from '../../util/calculation';
import { renderStateSelector } from '../../store/threed/camera/selector';
import { ModelRenderStateEnum } from '../../store/threed/camera/slice';
import { outlineMaterial } from './materials/outline-material/outline-material';
import { simpleColorMaterial } from './materials/simple-color-material/simple-color-material';
import { KeyTrackListSelectorKeyTrackListSelector } from '../../store/threed/keytrack/selector';
import { createAnimationClipFromMatrixData } from '../../store/threed/keytrack/util';
import { useFrame } from 'react-three-fiber';
import { FigureComposerAnimationClipStateSlice } from '../../store/threed/animation-clip/slice';
import { FigureComposerAnimationClipSelector } from '../../store/threed/animation-clip/selector';
import { createAnimationClipFromMixamoAsset } from '../../util/threed/animation-loader';

export type FigureComposerHandle = {
  updateImmediately: () => void;
  visibleBoneImmediately: () => void;
  hideBoneImmediately: () => void;
  visibleVRMImmediately: () => void;
  hideVRMImmediately: () => void;
};

const FigureComposer = forwardRef<
  FigureComposerHandle,
  { uuid: string } & {
    vrmRef: React.RefObject<VRM>;
  }
>(
  (
    props: { uuid: string } & {
      vrmRef: React.RefObject<VRM>;
    },
    ref,
  ) => {
    useImperativeHandle(ref, () => ({
      // 外からfigureComposerの状態を強制アップデートするためのコマンド
      // reactのサイクルに乗った切替では、動画生成の場合などに問題が出るため
      updateImmediately: () => {
        vrm?.update(0);
        animationAction?.getMixer().update(0);
        openPoseBonesRef.current?.updateBonesImmediately();
      },
      visibleBoneImmediately: () => {
        openPoseBonesRef.current?.visibleBonesImmediately();
      },
      hideBoneImmediately: () => {
        openPoseBonesRef.current?.hideBonesImmediately();
      },
      visibleVRMImmediately: () => {
        if (!vrm?.scene) return;
        vrm.scene.visible = true;
      },
      hideVRMImmediately: () => {
        if (!vrm?.scene) return;
        vrm.scene.visible = false;
      },
    }));
    const url = useSelector((state: RootState) => {
      return FigureComposerListSelector.getFileUrlById(state, props.uuid) || null;
    });
    const composerState = useSelector((state: RootState) => {
      return FigureComposerListSelector.getById(state, props.uuid) || null;
    });

    const modelRenderState = useSelector((state: RootState) => {
      return renderStateSelector.getModelRenderState(state);
    });
    useEffect(() => {
      console.log('[test]changeModelRenderState');
    }, [modelRenderState]);

    const playbackState = useSelector((state: RootState) => {
      return FigureComposerListSelector.getPlayMode(state, props.uuid);
    });

    const animationPlaybackState = useSelector((state: RootState) => {
      return FigureComposerAnimationPlaybackSelector.getPlaybackSetting(state);
    });

    const keyTrack = useSelector((state: RootState) => {
      return KeyTrackListSelectorKeyTrackListSelector.getKeyTrack(
        state,
        props.uuid,
        props.uuid,
      );
    });

    const animationClip = useSelector((state: RootState) => {
      return FigureComposerAnimationClipSelector.getAnimationClip(
        state,
        props.uuid,
        props.uuid,
      );
    });

    const objectToolHandler = useObjectToolHandler();
    const [loading, setLoading] = useState(true);
    const [hovered, setHovered] = useState(false);
    const vrmRef = useRef<VRM>(null);
    const meshRef = useRef<Group>(null);
    const dispatch = useDispatch();
    const [animationAction, setAnimationAction] = useState<AnimationAction>();
    const vrmTransformMatrixArray = useSelector((state: RootState) => {
      return (
        FigureComposerListSelector.getTransformArray(state, props.uuid) ||
        new Matrix4().identity().toArray()
      );
    });

    // 並行位置を、reduxに合わせる
    useEffect(() => {
      if (!meshRef.current) return;
      if (playbackState === PlayMode.animation) return; // animationモードでは合わせない
      const { position, scale, rotation } = extractTransform(vrmTransformMatrixArray);
      meshRef.current.position.copy(position);
      meshRef.current.rotation.copy(rotation);
      meshRef.current.scale.copy(scale);
    }, [vrmTransformMatrixArray, meshRef.current, playbackState]);

    //ポーズ情報をreduxに合わせる
    const boneNames = Object.keys(VRMHumanBoneName);

    // bones を格納するための変数
    const bones: { [key: string]: number[] | undefined } = {};

    boneNames.forEach(boneName => {
      const name = camelcase(boneName) as VRMHumanBoneName;
      const boneTransform = useSelector((state: RootState) =>
        FigureComposerListSelector.getBoneTransformArray(state, props.uuid, name),
      );
      useEffect(() => {
        if (!vrm || !boneTransform) return;
        if (playbackState === PlayMode.animation) return; // animationモードでは合わせない
        const { position, scale, rotation } = extractTransform(boneTransform);
        vrm.humanoid.getNormalizedBoneNode(name)?.rotation.copy(rotation);
        vrm.humanoid.getNormalizedBoneNode(name)?.position.copy(position);
        vrm.humanoid.getNormalizedBoneNode(name)?.scale.copy(scale);
        vrm.humanoid.update();
      }, [boneTransform, playbackState]);
    });

    const tool = useSelector((state: RootState) => {
      return toolSelector.getCurrent(state);
    });

    const openPoseBonesRef = useRef<OpenPoseBonesHandle | null>(null);

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

        dispatch(
          FigureComposerSlice.actions.setVRMPose({ id: props.uuid, pose: vrmPose }),
        );
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

    // アニメーションモードの時、animationに変更があったら再生する
    useEffect(() => {
      if (!keyTrack) return;
      if (!vrm) return;
      if (playbackState === PlayMode.animation) {
        const clip = createAnimationClipFromMatrixData(keyTrack, vrm);
        console.log(clip);
        const inMixer = new THREE.AnimationMixer(vrm.scene);

        const action = inMixer.clipAction(clip);
        action.startAt(0);
        action.play();
        setAnimationAction(action);
      }
    }, [playbackState, keyTrack, vrm]);

    const [animationDecodedClip, setAnimationDecodedClip] = useState<AnimationClip>();
    useEffect(() => {
      if (!animationClip) return;
      if (!vrm) return;
      setAnimationDecodedClip(createAnimationClipFromMixamoAsset(animationClip, vrm));
    }, [animationClip, vrm]);

    useEffect(() => {
      if (!animationDecodedClip) return;

      if (!vrm) return;
      if (playbackState === PlayMode.animation) {
        const inMixer = new THREE.AnimationMixer(vrm.scene);
        const action = inMixer.clipAction(animationDecodedClip);
        action.startAt(0);
        action.play();
        setAnimationAction(action);
      }
    }, [playbackState, animationDecodedClip, vrm]);

    useEffect(() => {
      if (!animationAction) return; // アニメーションがない場合は何もしない
      if (!animationDecodedClip) return;
      if (animationPlaybackState.isBackgroundMode) return; //バックグランドモードでは何もしない
      const mixer = animationAction.getMixer();
      const action = animationAction;
      const clip = animationAction.getClip();
      animationPlaybackState.isPlaying ? action.play() : action.stop();
      const newTime = animationPlaybackState.currentTime;
      action.time = newTime;
      action.getMixer().update(0);
      vrm?.update(0);
    }, [...Object.values(animationPlaybackState), animationAction, animationDecodedClip]);

    useFrame(() => {
      if (!animationAction) return;
      if (
        playbackState === PlayMode.animation &&
        animationPlaybackState.isPlaying &&
        !animationPlaybackState.isBackgroundMode
      ) {
        const time = (animationAction.time + 0.032) % animationAction.getClip().duration;
        dispatch(animationPlaybackSlice.actions.setCurrentTime(time));
      }
    });

    const isFlagSet = useCallback(
      (flag: number) => {
        return (modelRenderState & flag) > 0;
      },
      [modelRenderState],
    );

    // hover時、select時に見た目を変更する
    useEffect(() => {
      console.log('material change');
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
          composerState.composerSelectState === ComposerSelectState.selected &&
          obj.userData.selectedMaterial
            ? obj.userData.selectedMaterial
            : obj.userData.originalMaterial;
        obj.material = nextMat;

        let advancedMat: Material | null | Array<Material> = null;
        if (isFlagSet(ModelRenderStateEnum.renderDepth)) {
          advancedMat = new MeshDepthMaterial();
        }
        if (isFlagSet(ModelRenderStateEnum.renderOutline)) {
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
                objectToolHandler.figureComposerHandlers?.onMouseDown?.(
                  props.uuid,
                  event,
                );
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
          <group ref={meshRef} visible={isFlagSet(ModelRenderStateEnum.renderVRM)}>
            <primitive
              object={vrm.scene}
              ref={vrmRef}
              onPointerDown={(event: ThreeEvent<PointerEvent> | undefined) => {
                objectToolHandler.figureComposerHandlers?.onMouseDown?.(
                  props.uuid,
                  event,
                );
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
            ref={openPoseBonesRef}
            enable={isFlagSet(ModelRenderStateEnum.renderPoseBone)}
            uuid={props.uuid}
            targetVRM={vrm}>
            {}
          </OpenPoseBones>
          )
        </group>
      )) || <></>
    );
  },
);

export default FigureComposer;
