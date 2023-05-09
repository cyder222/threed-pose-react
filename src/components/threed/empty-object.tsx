import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 何もないところをクリックした時の処理を追加するために使うコンポーネント
export const EmptyObject = (props: {
  onClick?: (e?: THREE.Event) => void;
  onPointerUp?: (e?: THREE.Event) => void;
}) => {
  const { camera, gl, scene, mouse } = useThree();
  const raycaster = useRef(new THREE.Raycaster());

  const onPointerDown = () => {
    props.onClick?.();
  };

  useEffect(() => {
    // ツールモードが変更されたときのイベントリスナーを設定
    const handleMouseDown = (e: MouseEvent) => {
      raycaster.current.setFromCamera(mouse, camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);
      console.log(intersects);
      if (intersects.length === 0) {
        // 空白部分がクリックされたときにイベントを発生させる
        props.onClick?.(e);
      }
    };
    const handleMouseUp = (e: MouseEvent) => {
      raycaster.current.setFromCamera(mouse, camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);
      console.log(intersects);
      if (intersects.length === 0) {
        // 空白部分がクリックされたときにイベントを発生させる
        props.onPointerUp?.(e);
      }
    };

    addEventListener('pointerdown', handleMouseDown);
    addEventListener('pointerup', handleMouseUp);
    return () => {
      removeEventListener('pointerdown', handleMouseDown);
      removeEventListener('pointerup', handleMouseUp);
    };
  }, [props.onClick]);

  return (
    <mesh
      raycast={(_raycaster, intersects) => {
        // 空のオブジェクトは無視する
        intersects.length = 0;
      }}>
      <boxBufferGeometry args={[0.001, 0.001, 0.001]} />
      <meshBasicMaterial color='transparent' opacity={0} />
    </mesh>
  );
};
