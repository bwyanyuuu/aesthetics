#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;

void main(){
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
    // uv.x *= u_resolution.x/u_resolution.y;
    
    vec3 color = texture2D(u_tex0, uv).rgb;
    float info = (0.72*color.g + 0.21*color.r + 0.07*color.b);
    gl_FragColor = vec4(vec3(info), 1.0);
}