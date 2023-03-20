import React, { useEffect, useRef, useState } from 'react';
import useVRM from '../../hooks/use-vrm-hooks';
import {} from '@react-three/fiber';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/create-store';
import { FigureComposerListSelector } from '../../store/threed/figure-composer/selectors';
import { composerSelectState } from '../../store/threed/figure-composer/slice';

const FigureComposer = (props: { uuid: string }) => {
  const url = useSelector((state: RootState) => {
    return FigureComposerListSelector.getFileUrlById(state, props.uuid) || null;
  });
  const composerState = useSelector((state: RootState) => {
    return FigureComposerListSelector.getById(state, props.uuid) || null;
  });
  const [loading, setLoading] = useState(true);
  const vrmRef = useRef(null);

  const vrm = useVRM(
    url,
    e => {
      console.log((e.loaded / e.total) * 100 + '%');
    },
    () => {
      setLoading(false);
    },
  );

  return (
    (!loading && vrm && (
      <mesh position={composerState.vrmState.translate}>
        <primitive object={vrm.scene} ref={vrmRef} />
      </mesh>
    )) || <></>
  );
};

export default FigureComposer;
