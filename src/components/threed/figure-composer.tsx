import React, { useState } from 'react';
import useVRM from '../../hooks/use-vrm-hooks';
import {} from '@react-three/fiber';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/create-store';
import { FigureComposerListSelector } from '../../store/threed/figure-composer/selectors';

const FigureComposer = (props: { uuid: string }) => {
  const url = useSelector((state: RootState) => {
    return FigureComposerListSelector.getFileUrlById(state, props.uuid) || null;
  });
  const [loading, setLoading] = useState(true);

  const vrm = useVRM(
    url,
    e => {
      console.log((e.loaded / e.total) * 100 + '%');
    },
    () => {
      setLoading(false);
    },
  );

  return (!loading && vrm && <primitive object={vrm.scene} />) || <></>;
};

export default FigureComposer;
