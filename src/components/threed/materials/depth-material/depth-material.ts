import * as THREE from 'three';
import vertexShader from './vertexShader.vert';
import fragmentShader from './fragmentShader.frag';

// デプスシェーダ
export const depthShader: THREE.Shader = {
  uniforms: {
    nearClip: { value: 1 },
    farClip: { value: 1000 },
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
