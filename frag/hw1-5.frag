#ifdef GL_ES
precision mediump float;
#endif

#if defined( BUFFER_0 )
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_buffer0;

#define pi 3.141596
#define N 5.0

void main()
{
    vec2 uv = (gl_FragCoord.xy-0.5*u_resolution.xy)/u_resolution.y;
    vec2 UV = gl_FragCoord.xy/u_resolution.xy;
    vec3 col = vec3(0.);

    for(float i = 0.; i < 10.; i++){
        vec2 U = uv;
        float time = u_time*2. - i * 0.01;

        U.x += mix(0.5, -0.5, fract(time/20.));
        U.y += 0.02* cos((2. * pi / N) * 0.5 * time);
        U.y += 0.05* cos((2. * pi / N) * 2.5 * time);
        U.y += 0.01* cos((2. * pi / N) * 10.5 * time);
        U.y += 0.01* cos((2. * pi / N) * 20.5 * time);

        float f = 1. - step(0.002, length(U));
        col += f;
    }
    
    vec3 txt = texture2D(u_buffer0, UV.xy).rgb;
    col += txt * 0.95;

    gl_FragColor = vec4(col , 1.0);
}