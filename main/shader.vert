precision mediump float;
attribute vec3 aPosition;
attribute float aIndex;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uCount;
uniform vec2 uResolution;

void main() {
    vec3 p = aPosition;
    p.xy -= uResolution / 2.;
    vec4 positionVec4 =  vec4(p, 1.0);
    gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
    gl_PointSize = 1.5;
}