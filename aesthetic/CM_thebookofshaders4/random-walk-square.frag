#ifdef GL_ES
precision mediump float;
#endif

#if defined( BUFFER_0 )
#endif
#define T(U1) texture2D(u_buffer0, (U1)/R) 
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
float iTime=u_time;                       //更改 shadertoy->glsl editor  
vec2 iResolution=u_resolution;            //更改 shadertoy->glsl editor 
vec2 iMouse=u_mouse.xy;                   //更改 shadertoy->glsl editor
//vec2 gl_FragCoord = gl_FragCoord.xy;       //更改
uniform sampler2D u_buffer0;
uniform sampler2D u_tex0;                 //更改  Target DensityMap
uniform sampler2D u_tex1;                 //更改  Target MotionMap

#define KEY_RESET 82


float Cell( in vec2 p ){
    // do wrapping
    vec2 r = u_resolution.xy;
    p.x = mod((p.x + r.x), r.x);
    p.y = mod((p.y + r.y), r.y);
    
    // fetch texel
     // return (texelFetch(u_buffer0, p, 0 ).x > 0.5 ) ? 1 : 0;
    return texture2D(u_buffer0, p).x;
}

float hash1( float n ){
    return fract(sin(n)*138.5453123);
}

// bool key_down(int key) {
//     return int(texelFetch(KEYBOARD, vec2(key, 0), 0).x) == 1;
// }

float S(float x){
    return step(0.5,x);
}


// Code forked from Inigo Quilez's game of life shader
// https://www.shadertoy.com/view/XstGRf
// Reset code stolen from somewhere else - sorry!
// (Press R to reset shader)

void main(){
    vec2 px = gl_FragCoord.xy;
    
    vec2 R = iResolution.xy;
    vec4 O = T(px);
    // 按鍵清空
    // if (key_down(KEY_RESET) || iFrame == 0){    
    //     float f = 0.;
    //     if (gl_FragCoord.x > 0.5 * iResolution.x && gl_FragCoord.x < 0.5 * iResolution.x + 1.
    //     && gl_FragCoord.y > 0.5 * iResolution.y && gl_FragCoord.y < 0.5 * iResolution.y + 1.) f = 3.;

    //     fragColor = vec4( f, 0.0, 0.0, 0.0 );
    //     return;
    // }
        
    // center cell
    float e = Cell(px); 

    // neighbour cells
    float t = Cell(px + vec2(0,-1));
    float b = Cell(px + vec2(0,1));
    float l = Cell(px + vec2(-1,0));
    float r = Cell(px + vec2(1,0));   


    // 2 up, 3 right, 4 down, 5 left
    // 滑鼠點擊生成起始點
    if (gl_FragCoord.y > iMouse.y && gl_FragCoord.y < iMouse.y + 1.
    && gl_FragCoord.x > iMouse.x && gl_FragCoord.x < iMouse.x + 1.) e = 3.;
    else if (e > 1.) e = 1.;
    else if (b == 2.) e = 2.;
    else if (t == 4.) e = 4.;
    else if (l == 3.) e = 3.;
    else if (r == 5.) e = 5.;
    else  e -= 0.005;

    float q = hash1(gl_FragCoord.x*13.0 + 0.1 * iTime + hash1(gl_FragCoord.y*73.1));
    if (q > 0.95) // probability direction will change
    {
        // turn anticlockwise 
        // could easily be replaced with a function but I'm lazy atm
        if (e == 2.) e = 3.;
        else if (e == 3.) e = 4.;
        else if (e == 4.) e = 5.;
        else if (e == 5.) e = 2.;
    }


    O = vec4( e, 0.0, 0.0, 0.0 );
    //fragColor = vec4( 1. - step(3. * texelFetch( u_buffer0, vec2(gl_FragCoord), 0 ).x ,0.2));
    gl_FragColor = vec4( 3. * O.x );
}