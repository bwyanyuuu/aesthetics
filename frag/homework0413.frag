// ref image: http://www.boredpanda.com/single-line-plotter-scribbles-sergej-stoppel/
// ( doing it simpler: circles instead of scribbles ;-) )
#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;             
const float L = 4., T = 2.,  d = 1.;                   // density
uniform sampler2D u_tex0;
uniform sampler2D u_tex1;
#define T(U) texture2D(u_tex0, (U)/R).r // * 1.4
//#define T(U) sqrt( texture(iChannel0, (U)/R).r * 1.4 )
//#define T(U) length(texture(iChannel0, (U)/R).rgb)
    
#define rnd(P)  fract( sin( dot(P,vec2(12.1,31.7)) + 0.*u_time )*43758.5453123)
#define rnd2(P) fract( sin( (P) * mat2(12.1,-37.4,-17.3,31.7) )*43758.5453123)

#define C(U,P,r) smoothstep(1.5,0.,abs(length(P-U)-r))                       // ring
//#define C(U,P,r) exp(-.5*dot(P-U,P-U)/(r*r)) * sin(1.5*6.28*length(P-U)/r) // Gabor
float drawCircle(vec2 uv, vec2 center, float radius)
{
    return 1.0 - smoothstep(0.0, radius, length(uv - center));
}

const float MATH_PI	= float( 3.14159265359 );

void Rotate( inout vec2 p, float a ) 
{
	p = cos( a ) * p + sin( a ) * vec2( p.y, -p.x );
}

float Circle( vec2 p, float r )
{
    return ( length( p / r ) - 1.0 ) * r;
}

float Rand( vec2 c )
{
	return fract( sin( dot( c.xy, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 );
}

float saturate( float x )
{
	return clamp( x, 0.0, 1.0 );
}

vec3 BokehLayer(vec2 uv, vec2 p, vec3 c, float s )   
{
    // float wrap = 1000.0;    
    // if ( mod( floor( p.y / wrap + 0.5 ), 2.0 ) == 0.0 )
    // {
    //     p.x += wrap * 0.5;
    // }    
    
    // vec2 p2 = mod( p + 0.5 * wrap, wrap ) - 0.5 * wrap;
    // vec2 cell = floor( p / wrap + 0.5 );
    // float cellR = Rand( cell );
        
    // c *= fract( cellR * 3.33 + 3.33 );    
    // float radius = mix( 0.3, 0.7, s );
    // p2.x *= mix( 0.9, 1.1, fract( cellR * 11.13 + 11.13 ) );
    // p2.y *= mix( 0.9, 1.1, fract( cellR * 17.17 + 17.17 ) );
    
    // float sdf = Circle( p, s);
    // float circle = 1.0 - smoothstep( 0.0, 1.0, sdf * 0.04 );
    float circle = 1.0 - smoothstep(0.0, s, length(uv-p));
    float glow	 = exp( -400. * 0.025 ) * 0.3 * ( 1.0 - circle );
    return c * ( circle + glow );
}
void main()
{
    vec2 R = u_resolution.xy;
    vec2 U = gl_FragCoord.xy;
    vec4 O;
    O = vec4(0., 0., 0., 1.);
    // Rotate( ( 2.0 * gl_FragCoord.xy - u_resolution.xy ) / u_resolution.x, 0.2 +u_time * 0.03 );
    for (float j = -L; j <=L; j++)    // test potential circle centers in a window around U
        for (float i = -L; i <=L; i++) {
         // vec2 P = U+vec2(i,j);
            vec2 P = floor( U/T + vec2(i,j) ) *T;          // potential circle center
            P += T * (rnd2(P) - .5);
            float v = texture2D(u_tex1, (P)/R).r;
            float r = mix(2., L * T ,v);                     // target radius
            if ( rnd(P) < (v) / r * 4. * d / L * T * T ) {         // draw circle with probability
                // O += C(U,P,r)*.2 ; // * (1.-texture(iChannel0, (U)/R)); // colored variant
                // O += drawCircle(U, P, r*0.3); // * (1.-texture(iChannel0, (U)/R)); // colored variant
                O += vec4(BokehLayer(U, P, 3.0 * vec3( 0.4, 0.1, 0.2 ) ,r*.5), 1.);
            }
        }
    gl_FragColor = O;
}