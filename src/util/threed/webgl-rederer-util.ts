import * as THREE from 'three';

export function backgroundRender(originalRenderer: THREE.WebGLRenderer) {
  const contextAttributes = originalRenderer.getContext().getContextAttributes();
  if (!contextAttributes) return { renderer: null, canvas: null };

  const newCanvas = document.createElement('canvas');
  const oldCanvas = originalRenderer.domElement;
  newCanvas.width = oldCanvas.width;
  newCanvas.height = oldCanvas.height;
  newCanvas.style.cssText = oldCanvas.style.cssText; // スタイルもコピー（必要に応じて）

  const parameters = {
    // 新しいcanvasを作成して設定
    canvas: newCanvas,
  };

  const newRenderer = new THREE.WebGLRenderer(parameters);

  // 以下、その他の設定のコピー
  const size = originalRenderer.getSize(new THREE.Vector2());
  newRenderer.setSize(size.x, size.y);
  newRenderer.setPixelRatio(originalRenderer.getPixelRatio());

  newRenderer.setClearColor(
    originalRenderer.getClearColor(new THREE.Color()),
    originalRenderer.getClearAlpha(),
  );

  newRenderer.shadowMap.enabled = originalRenderer.shadowMap.enabled;
  newRenderer.shadowMap.type = originalRenderer.shadowMap.type;

  newRenderer.toneMapping = originalRenderer.toneMapping;
  newRenderer.toneMappingExposure = originalRenderer.toneMappingExposure;

  newRenderer.outputEncoding = originalRenderer.outputEncoding;
  newRenderer.physicallyCorrectLights = originalRenderer.physicallyCorrectLights;

  return { renderer: newRenderer, canvas: newCanvas };
}
