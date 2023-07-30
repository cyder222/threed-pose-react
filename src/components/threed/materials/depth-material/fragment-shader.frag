// fragmentShader.glsl
uniform float nearClip;
uniform float farClip;
varying vec3 vWorldPosition;
void main() {
  float depth = gl_FragCoord.z / gl_FragCoord.w;
  depth = depth * (farClip - nearClip) + nearClip;
  gl_FragColor = vec4( vec3( 1.0 - depth / (2.0 * farClip) ), 1.0 );
}
