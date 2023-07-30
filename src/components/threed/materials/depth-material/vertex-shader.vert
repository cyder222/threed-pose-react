precision mediump float;

uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
attribute vec3 position;

varying vec3 vWorldPosition;

void main() {
  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}