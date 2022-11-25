// Author:
// Title:

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
const float pi = 3.1415968;
#define M_SQRT_2 1.414

// 發光效果 光跟穎的過渡過程 (距離、發光強度、線條寬度)
float glow(float d, float str, float thickness){
    return thickness / pow(d, str);
}
//Gradient Noise
vec2 hash2( vec2 x )			//亂數範圍 [-1,1]
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return -1.0 + 2.0*fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}
float gnoise( in vec2 p )		//亂數範圍 [-1,1]
{
    vec2 i = floor( p );
    vec2 f = fract( p );
	
    vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( dot( hash2( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                     	    dot( hash2( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                	     mix( dot( hash2( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                     	    dot( hash2( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}
float fbm(in vec2 uv)		//亂數範圍 [-1,1]
{
	float f;												//fbm - fractal noise (4 octaves)
	mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );
	f   = 0.5000*gnoise( uv ); uv = m*uv;		  
	f += 0.2500*gnoise( uv ); uv = m*uv;
	f += 0.1250*gnoise( uv ); uv = m*uv;
	f += 0.0625*gnoise( uv ); uv = m*uv;
	return f;
}
vec3 hash( vec3 p ) // replace this by something better
{
    p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
              dot(p,vec3(269.5,183.3,246.1)),
              dot(p,vec3(113.5,271.9,124.6)));

    return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}
float noise3d( in vec3 p )
{
    vec3 i = floor( p );
    vec3 f = fract( p );
    
    vec3 u = f*f*(3.0-2.0*f);

    return mix( mix( mix( dot( hash( i + vec3(0.0,0.0,0.0) ), f - vec3(0.0,0.0,0.0) ), 
                          dot( hash( i + vec3(1.0,0.0,0.0) ), f - vec3(1.0,0.0,0.0) ), u.x),
                     mix( dot( hash( i + vec3(0.0,1.0,0.0) ), f - vec3(0.0,1.0,0.0) ), 
                          dot( hash( i + vec3(1.0,1.0,0.0) ), f - vec3(1.0,1.0,0.0) ), u.x), u.y),
                mix( mix( dot( hash( i + vec3(0.0,0.0,1.0) ), f - vec3(0.0,0.0,1.0) ), 
                          dot( hash( i + vec3(1.0,0.0,1.0) ), f - vec3(1.0,0.0,1.0) ), u.x),
                     mix( dot( hash( i + vec3(0.0,1.0,1.0) ), f - vec3(0.0,1.0,1.0) ), 
                          dot( hash( i + vec3(1.0,1.0,1.0) ), f - vec3(1.0,1.0,1.0) ), u.x), u.y), u.z );
}
mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}
float circle(vec2 uv, float size){
    float dist = length(uv);
    float circle_dist = abs(dist - size);
    return circle_dist;
}
float square(vec2 P, float size){
    return abs(max(abs(P.x), abs(P.y)) - size/(2.0*M_SQRT_2));
}
float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}
void main() {
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
    uv.x *= u_resolution.x/u_resolution.y;
    uv = uv * 2.0 - 1.0;

    vec3 color;
    for(int i = 0; i < 5; i++){
        uv *= rotate2d(5./pi); // 旋轉角度
        float noise_position = smoothstep(0.2, 0.7, -uv.y + 0.372);
        float noise_scale = 0.216 * noise_position;
        float noise_freq = 6.084;
        // 加入亂數，導致圓變得凹凸不平
        float circle_dist = circle(uv, 0.48 + noise_scale*noise3d(vec3(uv*noise_freq, u_time*float(i))));
        // float circle_dist = circle(uv, 0.48 + 0.45*random(ipos));
        float glow_circle = glow(circle_dist, 0.3, 0.03);
        color += vec3(glow_circle);
    }
    

    float breathing=sin(2.0*u_time/5.0*pi)*0.5+0.2;
    gl_FragColor = vec4(color * vec3(1.0, 0.5059, 0.9176), 1.0);
}