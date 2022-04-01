// Author:CMH
// Title:Basic distance function
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float square(vec2 P, float size){
    return abs(max(abs(P.x), abs(P.y)) - size/(1.0));
}
#define M_SQRT_2 1.41421356
float heart(vec2 P, float size){
    P.y*=-1.0;
	float x = M_SQRT_2/2.0 * (P.x - P.y);
	float y = M_SQRT_2/2.0 * (P.x + P.y);
	float r1 = max(abs(x),abs(y))-size/3.5;
	float r2 = length(P - M_SQRT_2/2.0*vec2(+1.0,-1.0)*size/3.5)- size/3.5;
	float r3 = length(P - M_SQRT_2/2.0*vec2(-1.0,-1.0)*size/3.5)- size/3.5;
	return min(min(r1,r2),r3);}
float sdFish(float i, vec2 p, float a) {
    float ds, c = cos(a), s = sin(a);
    p *= 1.3*mat2(c,s,-s,c); // Rotate and rescale
    p.x *= .97 + (.04+.2*p.y)*cos(i+9.*u_time);  // Swiming ondulation (+rotate in Z axes)
    ds = min(length(p-vec2(.8,0))-.45, length(p-vec2(-.14,0))-.12);   // Distance to fish
    p.y = abs(p.y)+.13;
    return max(min(length(p),length(p-vec2(.56,0)))-.3,-ds)*.05;
}
float glow(float d, float str, float thickness){
    return thickness / pow(d, str);
}
mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}
float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}
float mouseArea(vec2 uv, vec2 mouse, float size){
    float dist = length(uv - mouse);
    return smoothstep(size, 1.5 * size, dist);
}
void main() {
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
    uv.x *= u_resolution.x/u_resolution.y;
    
    vec2 resize = vec2(20.);

    // mouse 也要做預處理，uv 和 mouse 的處理要相同
    vec2 mouse = u_mouse.xy / u_resolution.xy;
    mouse.x *= u_resolution.x / u_resolution.y;
    vec2 imouse = floor(mouse * resize) / resize;

    // 滑鼠為圓心平滑的圓形
    // float area = mouseArea(uv, mouse, 0.2); 


    //grid repetition
    vec2 uvs=uv * resize;
    vec2 ipos = floor(uvs);  // get the integer coords
    vec2 fpos = fract(uvs);  // get the fractional coords
    uv= fpos*2.0-1.0;

    // 滑鼠為圓心像素化的圓形
    float area = mouseArea(ipos / resize, imouse, 0.15); 

    uv*= rotate2d(u_time*0.5 + area *1.5);
    
    //drawing distance function 
    float draw = square(uv, 0.7);//sdFish(1.0, uv, 0.1), square(uv, 0.362), heart(uv, 0.5)    
    //float glow_draw = smoothstep(0.003,0.00,draw); //1st method
    float glow_draw = glow(draw, 0.5, 0.076); //2nd method
    //float glow_draw = exp(-draw*800.0); //3rd method
    gl_FragColor = vec4(vec3(area),1.0) ;
}