import React, { useEffect, useMemo, useRef, useState } from 'react';
import useVRM from '../../hooks/use-vrm-hooks';
import { ThreeEvent } from '@react-three/fiber';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/create-store';
import { useTexture } from '@react-three/drei';
import { FigureComposerListSelector } from '../../store/threed/figure-composer/selectors';
import FigureComposerSlice, {
  ComposerSelectState,
} from '../../store/threed/figure-composer/slice';
import { toolSelector } from '../../store/threed/tool/selectors';
import * as THREE from 'three';
import { MToonMaterial, VRM } from '@pixiv/three-vrm';
import { deserializeVector3 } from '../../util/store/three-seiralize';

const FigureComposer = (props: { uuid: string }) => {
  const url = useSelector((state: RootState) => {
    return FigureComposerListSelector.getFileUrlById(state, props.uuid) || null;
  });
  const composerState = useSelector((state: RootState) => {
    return FigureComposerListSelector.getById(state, props.uuid) || null;
  });
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(false);
  const vrmRef = useRef<VRM>(null);
  const meshRef = useRef(null);
  const dispatch = useDispatch();

  const toolState = useSelector((state: RootState) => {
    return toolSelector.getCurrent(state);
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

  // hover時に見た目を変更する
  useEffect(() => {
    const setMaterial = (obj: THREE.Mesh, material: unknown, hover: boolean) => {
      if (material instanceof MToonMaterial) {
        // MToonMaterialの場合
        hover
          ? material.uniforms.emissive.value.set(0x0000ff)
          : (material.uniforms.emissive.value =
              obj.userData.originalColor[material.uuid].clone());
      } else {
        // MeshStandardMaterialやMeshBasicMaterialの場合
        const mat = material as THREE.MeshBasicMaterial;
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
  }, [hovered]);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    switch (toolState.toolMode) {
      case 'move': {
        setHovered(true);
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
    switch (toolState.toolMode) {
      case 'move': {
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
    console.log('handlePointerOut');
    switch (toolState.toolMode) {
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
  return (
    (!loading && vrm && (
      <group>
        <mesh
          ref={meshRef}
          position={deserializeVector3(composerState.vrmState.translate)}>
          <primitive object={vrm.scene} ref={vrmRef} onPointerDown={handlePointerDown} />
        </mesh>
        {vrmBoundingBox && (
          <primitive
            position={vrm.scene.position}
            object={vrmBoundingBox}
            onPointerOver={handlePointerEnter}
            onPointerLeave={handlePointerOut}></primitive>
        )}
      </group>
    )) || <></>
  );
};

export default FigureComposer;
