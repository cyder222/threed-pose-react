#version 300 es
precision mediump float;
uniform float nearClip;
uniform float farClip;
in vec3 vWorldPosition;
out vec4 fragColor;
void main() {
  float depth = gl_FragCoord.z / gl_FragCoord.w;
  depth = depth * (farClip - nearClip) + nearClip;
  fragColor = vec4( vec3( 1.0 - depth / farClip ), 1.0 );
}