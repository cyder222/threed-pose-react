import { Shader, ShaderMaterial } from 'three';

export const SimpleColorShader: Shader = {
  uniforms: {},
  vertexShader: `
    #include <skinning_pars_vertex>
    void main() {
      #include <beginnormal_vertex>
      #include <defaultnormal_vertex>

      #include <skinbase_vertex>
      #include <begin_vertex>
      #include <skinning_vertex>
      #include <project_vertex>
      gl_Position = projectionMatrix * modelViewMatrix  * vec4(transformed, 1.0); ;
    }
  `,
  fragmentShader: `
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // 白色
    }
  `,
};

// メッシュのマテリアルとしてシェーダを使用
export const simpleColorMaterial = new ShaderMaterial({
  uniforms: SimpleColorShader.uniforms,
  vertexShader: SimpleColorShader.vertexShader,
  fragmentShader: SimpleColorShader.fragmentShader,
});
