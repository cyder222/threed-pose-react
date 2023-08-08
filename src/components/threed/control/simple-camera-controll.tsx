import React, { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

interface MousePosition {
  x: number;
  y: number;
}

interface CameraControlsProps {
  enabled: boolean;
}

const CameraControls: React.FC<CameraControlsProps> = ({ enabled }) => {
  const { camera, gl } = useThree();

  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [prevMousePosition, setPrevMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });

  const handleMouseDown = (event: MouseEvent) => {
    if (!enabled) {
      return;
    }
    if (event.button === 0) {
      // Left mouse button
      setIsDragging(true);
    } else if (event.button === 2) {
      // Right mouse button
      setIsPanning(true);
    }
    setPrevMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseUp = (event: MouseEvent) => {
    if (event.button === 0) {
      setIsDragging(false);
    } else if (event.button === 2) {
      setIsPanning(false);
    }
    setPrevMousePosition({ x: 0, y: 0 });
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!enabled) {
      return;
    }
    if (isDragging) {
      const xDiff = (event.clientX - prevMousePosition.x) * 0.01;
      const yDiff = (event.clientY - prevMousePosition.y) * 0.01;

      camera.rotation.y -= xDiff;
      camera.rotation.x -= yDiff;
    } else if (isPanning) {
      const xDiff = (event.clientX - prevMousePosition.x) * 0.01;
      const yDiff = (event.clientY - prevMousePosition.y) * 0.01;

      camera.position.x -= xDiff;
      camera.position.y += yDiff;
    }

    setPrevMousePosition({ x: event.clientX, y: event.clientY });
  };

  useEffect(() => {
    const domElement = gl.domElement;
    domElement.addEventListener('contextmenu', e => e.preventDefault());
    domElement.addEventListener('mousedown', handleMouseDown);
    domElement.addEventListener('mouseup', handleMouseUp);
    domElement.addEventListener('mousemove', handleMouseMove);

    return () => {
      domElement.removeEventListener('contextmenu', e => e.preventDefault());
      domElement.removeEventListener('mousedown', handleMouseDown);
      domElement.removeEventListener('mouseup', handleMouseUp);
      domElement.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gl.domElement, handleMouseDown, handleMouseUp, handleMouseMove]);

  return null;
};

export default CameraControls;
