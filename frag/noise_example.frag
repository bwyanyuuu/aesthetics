// Author: CMH

// Title: noise family

#ifdef GL_ES

precision mediump float;

#endif

uniform vec2 u_resolution;

uniform vec2 u_mouse;

uniform float u_time;




float hash1(vec2 p)			//亂數範圍 [-1,1]

{

    p  = 50.0*fract( p*0.3183099 + vec2(0.71,0.113));

    return -1.0+2.0*fract( p.x*p.y*(p.x+p.y) );}

vec2 hash2( vec2 x )			//亂數範圍 [-1,1]

{

    const vec2 k = vec2( 0.3183099, 0.3678794 );

    x = x*k + k.yx;

    return -1.0 + 2.0*fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );}

float gnoise( in vec2 p )		//亂數範圍 [-1,1]

{

    vec2 i = floor( p );

    vec2 f = fract( p );

	

    vec2 u = f*f*(3.0-2.0*f);




    return mix( mix( dot( hash2( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 

                     	    dot( hash2( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),

                	     mix( dot( hash2( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 

                     	    dot( hash2( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);}

#define Use_Perlin

//#define Use_Value

float noise( in vec2 p )		//亂數範圍 [-1,1]

{

#ifdef Use_Perlin    

return gnoise(p);	//gradient noise

#elif defined Use_Value

return vnoise(p);		//value noise

#endif    

return 0.0;

}

float fbm(in vec2 uv)		//亂數範圍 [-1,1]

{

	float f;												//fbm - fractal noise (4 octaves)

	mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );

	f  = 1.0000*noise( uv-0.1*u_time ); uv = m*uv;		  

	f += 0.500*noise( uv-0.1*u_time ); uv = m*uv;

	f += 0.250*noise( uv ); uv = m*uv;

	f += 0.125*noise( uv); uv = m*uv;

	return f;

}




void main() {

    vec2 st = gl_FragCoord.xy/u_resolution.xy;

    st.x *= u_resolution.x/u_resolution.y;

    st*=1.0;

 	int index=6;

    vec3 x;

    if(index==0) 	  x = vec3(hash1(st*80.0));//-------測試噪音放大縮小皆相似----------

    else if(index==1) x = vec3(gnoise(st*80.0)); //------測試perlin noise放大縮小----------

	else if(index==2) x = vec3(gnoise(st*4.0));//------測試perlin noise--

	else if(index==3) x = vec3(fbm( st*4.0));//------測試fbm----- vec3(fnoise( 0.4*q3));

	else if(index==4) x = vec3(fbm( st*4.0+ fbm(st*6.0)  ));//二層遞廻fbm perlin noise  

	else if(index==5) x = vec3(fbm( st*4.0+ fbm(st*6.0+ fbm(st*8.0+0.1*u_time))));//三層遞廻fbm perlin noise

    else if(index==6) x = vec3(fbm( st*8.0+ fbm(st*6.0+ fbm(st*4.0+0.1*u_time))));//三層遞廻fbm perlin noise

    

	vec3 col1 = vec3(0., 0.2, 0.5);

	vec3 col2 = vec3(1.0, 1.0, 1.0)*1.0;

	gl_FragColor = vec4( mix(col1, col2, x.x*0.5+0.5), 1.0 ); //noise[-1,1] —> [0,1]

}

