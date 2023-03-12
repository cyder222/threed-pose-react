import { useState, useEffect } from 'react';
import { VRM, VRMLoaderPlugin } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function loadVRM(
  url: string,
  onProgress: (event: ProgressEvent<EventTarget>) => void,
): Promise<VRM> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    // Install GLTFLoader plugin
    loader.register(parser => {
      return new VRMLoaderPlugin(parser);
    });
    loader.load(
      url,
      gltf => {
        resolve(gltf.userData.vrm as VRM);
      },
      onProgress,
      reject,
    );
  });
}

function useVRM(
  url: string | null,
  onProgress: (event: ProgressEvent<EventTarget>) => void,
  onFinish: () => void,
) {
  const [vrm, setVrm] = useState<VRM | null>(null);

  useEffect(() => {
    if (!url) return;
    (async () => {
      const vrms = await loadVRM(url, onProgress);
      setVrm(vrms);
      onFinish();
    })();
  }, [url]);

  return vrm;
}

export default useVRM;
