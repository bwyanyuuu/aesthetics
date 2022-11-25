#define NUM_PARTICLES	75
#define NUM_FIREWORKS	5
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;
vec3 pow3(vec3 v, float p)
{
    return pow(abs(v), vec3(p));
}

vec2 noise(vec2 tc)
{
    return (2.*texture2D(u_tex0, tc).xy-1.).xy;
}
vec2 hash2( vec2 x )			//亂數範圍 [-1,1]
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return -1.0 + 2.0*fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}

vec3 fireworks(vec2 p)
{
    vec3 color = vec3(0., 0., 0.);
    
    for(int fw = 0; fw < NUM_FIREWORKS; fw++)
    {
        vec2 pos = hash2(vec2(0.82, 0.11)*float(fw))*1.5;
    	float time = mod(u_time*3., 6.*(1.+hash2(vec2(0.123, 0.987)*float(fw)).x));
        for(int i = 0; i < NUM_PARTICLES; i++)
    	{
        	vec2 dir = hash2(vec2(0.512, 0.133)*float(i));
            dir.y -=time * 0.1;
            float term = 1./length(p-pos-dir*time)/50.;
            color += pow3(vec3(
                term * hash2(vec2(0.123, 0.133)*float(i)).y,
                0.8 * term * hash2(vec2(0.533, 0.133)*float(i)).x,
                0.5 * term * hash2(vec2(0.512, 0.133)*float(i)).x),
                          1.25);
        }
    }
    return color;
}

vec3 flag(vec2 p)
{
    vec3 color;
    
    p.y += sin(p.x*1.3+u_time)*0.1;
    
    if(p.y > 0.) 	color = vec3(1.);
    else			color = vec3(1., 0., 0.);
    
    color *= sin(3.1415/2. + p.x*1.3+u_time)*0.3 + 0.7;
    
    return color * 0.15;
}

void main()
{
	vec2 p = 2. * gl_FragCoord.xy / u_resolution.xy - 1.;
    p.x *= u_resolution.x / u_resolution.y;
    
    vec3 color = fireworks(p) + flag(p);
    gl_FragColor = vec4(color, 1.);
}