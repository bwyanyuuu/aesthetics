precision mediump float;
precision mediump int;
uniform vec3 uColor;

void main(){
    gl_FragColor = vec4(uColor, 1.); 
}