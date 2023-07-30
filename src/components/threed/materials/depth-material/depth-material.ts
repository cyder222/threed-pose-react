import * as THREE from 'three';
import vertexShader from './vertex-shader.vert';
import fragmentShader from './fragment-shader.frag';

// デプスシェーダ
export const depthShader: THREE.Shader = {
  uniforms: {
    nearClip: { value: 0.5 },
    farClip: { value: 5 },
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
};

// メッシュのマテリアルとしてデプスシェーダを使用
export const depthMaterial = new THREE.ShaderMaterial({
  uniforms: depthShader.uniforms,
  vertexShader: depthShader.vertexShader,
  fragmentShader: depthShader.fragmentShader,
});
