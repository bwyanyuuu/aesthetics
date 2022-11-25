#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;
uniform sampler2D u_tex1;
    
#define rnd(P)  fract( sin( dot(P,vec2(12.1,31.7)) + 0.*u_time )*43758.5453123)
#define rnd2(P) fract( sin( (P) * mat2(12.1,-37.4,-17.3,31.7) )*43758.5453123)
#define circle(uv, p, s) vec3(0.2667, 0.8902, 1.0)*(1.0 - smoothstep(0.0, s, length(uv-p)))

const float a = exp( -400. * 0.025 ) * 0.3;
const float L = 8., T = 4.,  d = 1.; 

void main()
{
    vec2 R = u_resolution.xy;
    vec2 U = gl_FragCoord.xy;
    vec4 O = vec4(0., 0., 0., 1.);
    float c = 0.;
    for (float j = -L; j <= L; j++)
        for (float i = -L; i <= L; i++) {
            vec2 P = floor( U / T + vec2(i, j) ) * T;
            P += T * (rnd2(P) - .5);
            vec3 color = texture2D(u_tex1, P / R).rgb;
            float v = (0.72*color.g + 0.21*color.r + 0.07*color.b);
            float r = mix(2., L * T , v);
            if ( rnd(P) < (v) / r * 4. * d / L * T * T ) {
                O += vec4(circle(U, P, r*.3), 1.);
            }
        }
    gl_FragColor = O;
}