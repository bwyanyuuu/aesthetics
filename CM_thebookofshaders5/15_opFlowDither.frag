// Author: CMH (optical flow 有瑕疵！)
// Title: 20200319_glsl Vector field_v1.qtz

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex1;
uniform sampler2D u_buffer0; //1st pass: last frame
uniform sampler2D u_buffer1; //2nd pass: optical flow + timelapse average
uniform sampler2D u_buffer2; //3rd pass: motion vector/dithering

vec4 opticalFlow(sampler2D src_c_img, sampler2D src_p_img, vec2 uv)
{
float scale=9.0;
float offset=0.01; 
float threshold=0.03;
float lambda=0.01;

	//vec2 	uv = gl_FragCoord.xy/iResolution.xy;
	vec2 	pos = uv;
	vec2	off_x = vec2(offset, 0.0);
	vec2	off_y = vec2(0.0, offset);
	
	//get the difference
	float 	scr_dif, gradx, grady;
	scr_dif =	texture2D(src_p_img, pos).g - texture2D(src_c_img, pos).g;
	
	//calculate the gradient
	gradx =	texture2D(src_p_img, pos + off_x).g - texture2D(src_p_img, pos - off_x).g;
	gradx +=	texture2D(src_c_img, pos + off_x).g - texture2D(src_c_img, pos - off_x).g;
	
	grady =	texture2D(src_p_img, pos + off_y).g - texture2D(src_p_img, pos - off_y).g;
	grady +=	texture2D(src_c_img, pos + off_y).g - texture2D(src_c_img, pos - off_y).g;
	
	float gradmag = sqrt((gradx*gradx)+(grady*grady)+lambda);
	
	float vxd = scr_dif*(gradx/gradmag);
	float vyd = scr_dif*(grady/gradmag);
		
	float xout = 0.0;
	if (abs(vxd) > threshold) xout = (vxd - threshold) * -scale; 
	float yout = 0.0;
	if (abs(vyd) > threshold) yout = (vyd - threshold) * -scale; 
	
	return vec4(xout, yout, 0.0, 1.0);
}


//2nd Pass: Dithering==============
// ref image: http://www.boredpanda.com/single-line-plotter-scribbles-sergej-stoppel/
// ( doing it simpler: circles instead of scribbles ;-) )
////#define T(U) texture2D(iChannel0, (U)/R).r // * 1.4
////#define T(U) sqrt( texture2D(iChannel0, (U)/R).r * 1.4 )
//#define T(U) length(texture2D(u_buffer1, (U)/R).rgb)    
//#define rnd(P)  fract( sin( dot(P,vec2(12.1,31.7)) + 0.*u_time )*43758.5453123)
//#define rnd2(P) fract( sin( (P) * mat2(12.1,-37.4,-17.3,31.7) )*43758.5453123)
//#define C(U,P,r) smoothstep(1.5,0.,abs(length(P-U)-r))                       // ring
////#define C(U,P,r) exp(-.5*dot(P-U,P-U)/(r*r)) * sin(1.5*6.28*length(P-U)/r) // Gabor
float T1(vec2 U){return length(texture2D(u_buffer2, (U)/u_resolution.xy).rgb);}    
float rnd(vec2 P){return fract( sin( dot(P,vec2(12.1,31.7)) + 0.*u_time )*43758.5453123);}
vec2 rnd2(vec2 P){return fract( sin( (P) * mat2(12.1,-37.4,-17.3,31.7) )*43758.5453123);}
float C(vec2 U, vec2 P, float r){return smoothstep(1.5,0.,abs(length(P-U)-r));}                    // ring


vec4 Dithering()
{
const int L = 4;                   // L*T = neightborhood size
float T = 8.,                   // grid step for circle centers
      d = 1.;                   // density
    vec4 O;
    vec2 U=gl_FragCoord.xy;
    vec2 R = u_resolution.xy;
//  O += T(U)-O; return;
    O += 1.-O; 

    for (int j = -L; j <=L; j++)    // test potential circle centers in a window around U
        for (int i = -L; i <=L; i++) {
         // vec2 P = U+vec2(i,j);
            vec2 P = floor( U/T + vec2(i,j) ) *T;          // potential circle center
            P += T*(rnd2(P)-.5);
            float v = T1(P);                               // target grey value
                 float r = mix(2., float(L)*T ,v);                     // target radius
            if ( rnd(P) < (1.-v)/ r*4.*d /float(L)*T*T )          // draw circle with probability
                O -= C(U,P,r)*.2 ; // * (1.-texture(iChannel0, (U)/R)); // colored variant
        }
 // O = sqrt(O);
 return O;
}

//2nd Pass: Motion Vector==============
// 2D vector field visualization by Matthias Reitinger, @mreitinger
// Based on "2D vector field visualization by Morgan McGuire, http://casual-effects.com", https://www.shadertoy.com/view/4s23DG
const float ARROW_TILE_SIZE = 12.0;
// Computes the center pixel of the tile containing pixel pos
vec2 arrowTileCenterCoord(vec2 pos) {
	return (floor(pos / ARROW_TILE_SIZE) + 0.5) * ARROW_TILE_SIZE;}
// Computes the signed distance from a line segment
float line(vec2 p, vec2 p1, vec2 p2) {
	vec2 center = (p1 + p2) * 0.5;
	float len = length(p2 - p1);
	vec2 dir = (p2 - p1) / len;
	vec2 rel_p = p - center;
	float dist1 = abs(dot(rel_p, vec2(dir.y, -dir.x)));
	float dist2 = abs(dot(rel_p, dir)) - 0.5*len;
	return max(dist1, dist2);}
// v = field sampled at arrowTileCenterCoord(p), scaled by the length
// desired in pixels for arrows
// Returns a signed distance from the arrow
float arrow(vec2 p, vec2 TileCenterCoord, vec2 v) {
	// Make everything relative to the center, which may be fractional
	p -= TileCenterCoord;		
	float mag_v = length(v), mag_p = length(p);
	if (mag_v > 0.0) {
		// Non-zero velocity case
		vec2 dir_v = v / mag_v;	
		// We can't draw arrows larger than the tile radius, so clamp magnitude.
		// Enforce a minimum length to help see direction
		mag_v = clamp(mag_v, 5.0, ARROW_TILE_SIZE * 0.5 * 3.0 );
		// Arrow tip location
		v = dir_v * mag_v;
		// Signed distance from shaft
		float shaft = line(p, v, -v);
		// Signed distance from head
		float head = min(line(p, v, 0.2*v + 0.8*vec2(-v.y, v.x)),
		                 line(p, v, 0.2*v + 0.8*vec2(v.y, -v.x)));
		return min(shaft, head);
	} else {
		// Signed distance from the center point
		return mag_p;
	}
}

// The vector field; use your own function or texture
vec3 field(vec2 pos) {
	return texture2D(u_buffer2, pos/u_resolution.xy).xyz; //影像motion資訊本身[-1~1]維持vector field[-1~1]
}

vec4 motionVector() {
	vec2 center=arrowTileCenterCoord(gl_FragCoord.xy);
	vec2 center1= center+vec2(-1,-1)*ARROW_TILE_SIZE;
	vec2 center2= center+vec2(-1, 0)*ARROW_TILE_SIZE;
	vec2 center3= center+vec2(-1, 1)*ARROW_TILE_SIZE;
	vec2 center4= center+vec2( 0,-1)*ARROW_TILE_SIZE;
	vec2 center5= center+vec2( 0, 1)*ARROW_TILE_SIZE;
	vec2 center6= center+vec2( 1,-1)*ARROW_TILE_SIZE;
	vec2 center7= center+vec2( 1, 0)*ARROW_TILE_SIZE;
	vec2 center8= center+vec2( 1, 1)*ARROW_TILE_SIZE;

	float arrow_dist = arrow(gl_FragCoord.xy, center, 
	                         field(center).xy * ARROW_TILE_SIZE * 0.4 *3.0);
	float arrow_dist1 = arrow(gl_FragCoord.xy, center1, field(center1).xy * ARROW_TILE_SIZE * 0.4 *3.0);
	float arrow_dist2 = arrow(gl_FragCoord.xy, center2, field(center2).xy * ARROW_TILE_SIZE * 0.4 *3.0);
	float arrow_dist3 = arrow(gl_FragCoord.xy, center3, field(center3).xy * ARROW_TILE_SIZE * 0.4 *3.0);
	float arrow_dist4 = arrow(gl_FragCoord.xy, center4, field(center4).xy * ARROW_TILE_SIZE * 0.4 *3.0);
	float arrow_dist5 = arrow(gl_FragCoord.xy, center5, field(center5).xy * ARROW_TILE_SIZE * 0.4 *3.0);
	float arrow_dist6 = arrow(gl_FragCoord.xy, center6, field(center6).xy * ARROW_TILE_SIZE * 0.4 *3.0);
	float arrow_dist7 = arrow(gl_FragCoord.xy, center7, field(center7).xy * ARROW_TILE_SIZE * 0.4 *3.0);
	float arrow_dist8 = arrow(gl_FragCoord.xy, center8, field(center8).xy * ARROW_TILE_SIZE * 0.4 *3.0);
	arrow_dist = min(min(min(min(min(min(min(min(arrow_dist,arrow_dist1),arrow_dist2),arrow_dist3),arrow_dist4),arrow_dist5),arrow_dist6),arrow_dist7),arrow_dist8);                                              
	vec4 arrow_col = vec4(clamp(arrow_dist, 0.0, 1.0));
	vec4 field_col = vec4(field(gl_FragCoord.xy), 1.0);
	
	return vec4(1.0-arrow_col);//vec4(1.0-arrow_col)
	//gl_FragColor = 1.0-arrow_col;
	//gl_FragColor = mix(1.0-arrow_col, field_col, 0.0);
	//gl_FragColor = (1.0-arrow_col)+field_col;
}


//==============

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;				//screen coordinate
    //vec3 color = texture2D(u_tex1, st).rgb;
    //vec3 luma= vec3(0.21*color.r + 0.72*color.g + 0.07*color.b);  //perceptually relevant
    
    #if defined( BUFFER_0 )
    	gl_FragColor = texture2D(u_tex1, st);
    #elif defined( BUFFER_1 )
    	gl_FragColor = texture2D(u_buffer0, st);
    #elif defined( BUFFER_2 )
    	gl_FragColor = mix(opticalFlow(u_tex1, u_buffer1, st), texture2D(u_buffer2, st), 0.95);
    #else
    	gl_FragColor = Dithering();
    #endif
}


