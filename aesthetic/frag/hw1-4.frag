#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

void main(){
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
    vec2 mouse = u_mouse / u_resolution;
    float size = 1.;
    vec2 big = vec2(u_resolution.x / size, u_resolution.y / size);
    vec2 uvs = uv * big; // xy 軸用不同比例的放大
    vec2 ipos = floor(uvs); // 把整個畫面分成一格一格 (ipos 為座標) 整數
    vec2 fpos = fract(uvs); // get the fractional coord
    vec2 nuv = ipos / big;
    
    
    vec3 color = texture2D(u_tex0, nuv).rgb;
    float intensity = (0.72*color.g + 0.21*color.r + 0.07*color.b);
    float n = random(uv*u_time);
    if(n < intensity){
        
        gl_FragColor = vec4(1.);
    }
    else{
        gl_FragColor = vec4(vec3(0.0), 1.);
    }    
}