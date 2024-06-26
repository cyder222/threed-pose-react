import { ShaderMaterial, BackSide } from 'three';
export const outlineMaterial = new ShaderMaterial({
  side: BackSide,
  transparent: true,
  vertexShader: `
    #include <skinning_pars_vertex>

    void main() {
      #include <skinbase_vertex>
      #include <begin_vertex>
      #include <skinning_vertex>
      #include <project_vertex>
      #include <beginnormal_vertex>
      #include <defaultnormal_vertex>
      #include <skinnormal_vertex>

      mvPosition = modelViewMatrix * vec4(transformed, 1.0);
      vec4 displacement = vec4( normalize( normalMatrix * objectNormal ) * 0.005, 0.0 ) + mvPosition;
      gl_Position = projectionMatrix * displacement;

    }`,
  fragmentShader: `
    void main() {
      gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
    }`,
});
