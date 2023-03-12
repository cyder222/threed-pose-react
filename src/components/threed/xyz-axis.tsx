import { useRef } from 'react';
import * as THREE from 'three';
import { Mesh } from 'three';

function Axis() {
  // X軸の矢印
  const arrowXRef = useRef<Mesh>(null);
  const arrowXPosition = new THREE.Vector3(1, 0, 0);
  const arrowXRotation = new THREE.Euler(0, 0, -Math.PI / 2);
  const arrowXColor = new THREE.Color(0xff0000);

  // Y軸の矢印
  const arrowYRef = useRef<Mesh>(null);
  const arrowYPosition = new THREE.Vector3(0, 1, 0);
  const arrowYRotation = new THREE.Euler(0, 0, Math.PI);
  const arrowYColor = new THREE.Color(0x00ff00);

  // Z軸の矢印
  const arrowZRef = useRef<Mesh>(null);
  const arrowZPosition = new THREE.Vector3(0, 0, 1);
  const arrowZRotation = new THREE.Euler(Math.PI / 2, 0, 0);
  const arrowZColor = new THREE.Color(0x0000ff);

  return (
    <>
      {/* X軸の円柱 */}
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 2, 32]} />
        <meshBasicMaterial color={arrowXColor} />
      </mesh>

      {/* X軸の矢印 */}
      <mesh ref={arrowXRef} position={arrowXPosition} rotation={arrowXRotation}>
        <coneGeometry args={[0.1, 0.2, 32]} />
        <meshBasicMaterial color={arrowXColor} />
      </mesh>

      {/* Y軸の円柱 */}
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 2, 32]} />
        <meshBasicMaterial color={arrowYColor} />
      </mesh>

      {/* Y軸の矢印 */}
      <mesh ref={arrowYRef} position={arrowYPosition} rotation={arrowYRotation}>
        <coneGeometry args={[0.1, 0.2, 32]} />
        <meshBasicMaterial color={arrowYColor} />
      </mesh>

      {/* Z軸の円柱 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 2, 32]} />
        <meshBasicMaterial color={arrowZColor} />
      </mesh>

      {/* Z軸の矢印 */}
      <mesh ref={arrowZRef} position={arrowZPosition} rotation={arrowZRotation}>
        <coneGeometry args={[0.1, 0.2, 32]} />
        <meshBasicMaterial color={arrowZColor} />
      </mesh>
    </>
  );
}

export default Axis;
