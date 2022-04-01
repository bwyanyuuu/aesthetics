#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;
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
float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}
float glow(float d, float str, float thickness){
    return thickness / pow(d, str);
}

void main(){
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
    // uv.x *= u_resolution.x/u_resolution.y;
    // vec2 uvs = uv * 100.0; // xy 軸同比例的放大
    vec2 mouse = u_mouse / u_resolution;
    // float size = 30./ pow(length(uv - u_mouse), 2.);
    float size = 5.;
    vec2 big = vec2(u_resolution.x / size, u_resolution.y / size);
    // vec2 big = u_mouse;
    vec2 uvs = uv * big; // xy 軸用不同比例的放大
    vec2 ipos = floor(uvs); // 把整個畫面分成一格一格 (ipos 為座標) 整數
    vec2 fpos = fract(uvs); // get the fractional coord
    vec2 nuv = ipos / big;
    
    
    vec3 color = texture2D(u_tex0, nuv).rgb;
    float intensity = (0.72*color.g + 0.21*color.r + 0.07*color.b);
    // float n = random(uv*u_time);
    float n = random(uv);
    if(n < intensity){
        
        gl_FragColor = vec4(vec3(1.0), 1.);
    }
    else{
        gl_FragColor = vec4(vec3(0.0), 1.);
    }
    // gl_FragColor = vec4(vec3(intensity), 1.);
    
}