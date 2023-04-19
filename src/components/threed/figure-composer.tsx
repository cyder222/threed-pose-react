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
} from '../../store/threed/figure-composer/slice';
import useObjectToolHandler from '../../hooks/tools/use-scene-edit-tool';
import toolSlice from '../../store/threed/tool/slice';
import { toolSelector } from '../../store/threed/tool/selectors';
import * as THREE from 'three';
import { MToonMaterial, VRM } from '@pixiv/three-vrm';
import { deserializeVector3 } from '../../util/store/three-seiralize';
import { toolService } from '../../store/threed/tool/machine/object-tool-machine';
import figureComposerSlice from '../../store/threed/figure-composer/slice';
import { StateValueMap } from 'xstate';

const FigureComposer = (props: { uuid: string }) => {
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
  const meshRef = useRef(null);
  const transformControlRef = useRef<any>(null);
  const dispatch = useDispatch();

  const toolMode = useSelector((state: RootState) => {
    return toolSelector.getCurrentMode(state);
  });

  const vrm = useVRM(
    url,
    e => {
      console.log((e.loaded / e.total) * 100 + '%');
    },
    loadedVrm => {
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
      loadedVrm.scene.traverse(obj => {
        console.log(obj);
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
    const setMaterial = (obj: THREE.Mesh, material: unknown, hover: boolean) => {
      if (material instanceof MToonMaterial) {
        // MToonMaterialの場合
        if (composerState.composerSelectState === ComposerSelectState.selected) {
          material.uniforms.emissive.value.set(0x0000ff);
          return;
        }
        hover
          ? material.uniforms.emissive.value.set(0x0000ff)
          : (material.uniforms.emissive.value =
              obj.userData.originalColor[material.uuid].clone());
      } else {
        // MeshStandardMaterialやMeshBasicMaterialの場合
        const mat = material as THREE.MeshBasicMaterial;
        if (composerState.composerSelectState === ComposerSelectState.selected) {
          mat.color.set(0x0000ff);
          return;
        }
        hover
          ? mat.color.set(0x0000ff)
          : (mat.color = obj.userData.originalColor[mat.uuid].clone());
      }
    };
    vrm?.scene?.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((material: unknown) => {
            setMaterial(obj, material, hovered);
          });
        } else {
          setMaterial(obj, obj.material, hovered);
        }
      }
    });
  }, [hovered, composerState.composerSelectState]);

  // toolのModeに合わせて、composerの表示状態を変更する
  useEffect(() => {
    if (toolMode.startsWith('pose_')) {
      dispatch(
        figureComposerSlice.actions.changeDisplayState({
          id: props.uuid,
          displayState:
            composerRenderState.renderVRM + composerRenderState.renderControlCube,
        }),
      );
    }
  }, [toolMode]);

  const handlePointerDown = (event: THREE.Event) => {
    event.stopPropagation();

    switch (toolMode) {
      case 'idle': {
        toolService.send('SELECT');
        dispatch(
          figureComposerSlice.actions.changeSelectState({
            id: props.uuid,
            selectState: ComposerSelectState.selected,
          }),
        );
        break;
      }
      case 'target_selected': {
        dispatch(
          FigureComposerSlice.actions.changeSelectState({
            id: props.uuid,
            selectState: ComposerSelectState.selected,
          }),
        );
        break;
      }
      case 'pose': {
        break;
      }
      case 'scale': {
        break;
      }

      default:
        break;
    }
  };

  const handlePointerEnter = (event: ThreeEvent<PointerEvent>) => {
    switch (toolMode) {
      case 'move': {
        event.stopPropagation();
        setHovered(true);
        break;
      }
      case 'pose': {
        break;
      }
      case 'scale': {
        break;
      }

      default:
        break;
    }
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    switch (toolMode) {
      case 'move': {
        setHovered(false);
        break;
      }
      case 'pose': {
        break;
      }
      case 'scale': {
        break;
      }

      default:
        break;
    }
  };
  // 即時反応が欲しいので、stateにしてない
  let mouseUpOnTransform = true;
  return (
    (!loading && vrm && (
      <group ref={meshRef}>
        <TransformControls
          mode='translate'
          object={vrm.scene}
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
        <primitive
          object={vrm.scene}
          ref={vrmRef}
          onPointerDown={(event: THREE.Event | undefined) => {
            objectToolHandler.figureComposerHandlers?.onMouseDown?.(props.uuid, event);
          }}
          onPointerUp={(event: THREE.Event | undefined) => {
            objectToolHandler.figureComposerHandlers?.onMouseUp?.(props.uuid, event);
          }}
        />
      </group>
    )) || <></>
  );
};

export default FigureComposer;
