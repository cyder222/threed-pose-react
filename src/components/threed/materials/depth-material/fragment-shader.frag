precision mediump float;

uniform float nearClip;
uniform float farClip;
varying vec3 vWorldPosition;
void main() {
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    depth = depth * (farClip - nearClip) + nearClip;
    gl_FragColor = vec4( vec3( 1.0 - depth / farClip ), 1.0 );
}