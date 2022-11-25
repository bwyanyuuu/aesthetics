#ifdef GL_ES
precision mediump float;
#endif

#if defined( BUFFER_0 )
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
float iTime=u_time;                       //更改 shadertoy->glsl editor  
vec2 iResolution=u_resolution;            //更改 shadertoy->glsl editor 
vec2 iMouse=u_mouse.xy;                   //更改 shadertoy->glsl editor
uniform sampler2D u_buffer0;
uniform sampler2D u_tex0;                 //更改  Target DensityMap
uniform sampler2D u_tex1;                 //更改  Target MotionMap


#define CS(a)  vec2(cos(a),sin(a))
#define rnd(x) ( 2.* fract(456.68*sin(1e3*x+mod(iDate.w,100.))) -1.) // NB: mod(t,1.) for less packed pattern //亂數範圍 [-1,1]
#define rndx(x) (fract(456.68*sin(1e3*x+mod(iDate.w,100.)))) // NB: mod(t,1.) for less packed pattern //亂數範圍 [0,1]
#define T(U1) texture2D(u_buffer0, (U1)/R)  //FBO，持續更新粒子狀態
#define M(U2) texture2D(u_tex1, (U2)/R)  //初始照片，以MotionMap作為
#define D(U2) texture2D(u_tex0, (U2)/R)  //初始照片，以Density作為

float glow(float d, float str, float thickness){
    return thickness / pow(d, str);
}

vec2 hash2( vec2 x )            //亂數範圍 [-1,1]
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return -1.0 + 2.0*fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}

float gnoise( in vec2 p )       //亂數範圍 [-1,1]
{
    vec2 i = floor( p );
    vec2 f = fract( p );
    
    vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( dot( hash2( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                            dot( hash2( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                         mix( dot( hash2( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                            dot( hash2( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}

//Randomness code from Martin, here: https://www.shadertoy.com/view/XlfGDS
float Random_Final(vec2 uv, float seed)         //亂數範圍 [-1,1]
{
    float fixedSeed = abs(seed) + 1.0;
    float x = dot(uv, vec2(12.9898,78.233) * fixedSeed);
    return 2.*fract(sin(x) * 43758.5453)-1.;
}

vec2 randomPos(float time){
    float a = (fract(456.68*sin(1e3*u_time+mod(time,100.))));
    vec2 ret;
    if(a <= 1./3.) ret.x = -1.;
    else if (a <= 2./3.) ret.x = 0.;
    else ret.x = 1.;
    a = (fract(456.68*sin(1e3*u_time+mod(time+2.,100.))));
    if(a <= 1./3.) ret.y = -1.;
    else if (a <= 2./3.) ret.y = 0.;
    else ret.y = 1.;
    return ret;
}

/////////////////////////////////
const float r = 3.5, N = 100.; // width , number of worms

void main()
{
    vec4 iDate= vec4(iTime);
    vec2 U = gl_FragCoord.xy;           //input 
    vec2 R = iResolution.xy;
    vec4 O;                         //output
    vec4 O2;                         //output
    
//不懂！利用R定值讀取FBO,讀到最右下圖檔pixel訊息，紅色色版為零,
    if (T(R).x==0.) { U = abs(U/R*2.-1.); O  = vec4(max(U.x,U.y)>1.-r/R.y); O.w=0.; gl_FragColor=O; return;} // track window resize

//--STEP1.初始粒子位置於第一列--------
    // 1st column store worms state.
    if (U.y==0.5 && T(U).w==0.) {                           // initialize heads state: P, a, t
        O = vec4( R/2. + R/2.4* vec2(Random_Final(U.xy, iTime),Random_Final(U.xy, iTime+1.11)) , 3.14 * rnd(U.x+.2), mix(30., 150., rndx(U.x+3.*sin(u_time)))); //範圍[800x600]
        gl_FragColor=O; return;
    } 
    
//--STEP2.依據第一列粒子們，著色每一個像素
    // Other columns do the drawing.
    O = T(U);//讀取之前色彩結果，注意此時O是color data(yes)還是position data(no)
    
    //Drawing! 
    //--重要！ x<N需改成x<=N
    //--重要！*奇特思考方法！不確定效能是否合理，每個待更新的像素，與粒子們比較位置，以距離遠近決定著色方式！
    //讀取第一列由左至右的粒子資訊P,若P.w粒子生存,以length(P.xy-U)著色, P的資訊以座標系統是以pixel為單位
    for (float x=0.5; x<=N; x++) {
        vec4 P = T(vec2(x,0.5));// head state: P, a, t ;
        if (P.w>0.) O += (1.-step(0.0015, length((P.xy-U)/R)))* vec4(D(P.xy+randomPos(u_time)).xyz*0.5, 1.);
    }

//--STEP3.像素著色後，更新第一列粒子們新位置
    //U以整數pixel為單位，需注意特殊用法，第一列為0.5，第二列為1.5
    if (U.y==0.5) {                                         // --- head programms: worm strategy
        //讀取第一列粒子狀態指定為P，P.xy表示position, P.z儲存粒子差異化亂數, P.w表示粒子active
        vec4 P = T(U);                                     // head state: P, a, t 
        if (P.w>0.) {                                      // if active
            float a = P.z;                             // a=每個粒子旋轉角度 per particle
            a+=2.1/P.w;                                //值大曲度大：4.0初始圈數多,2.0螺旋,0.5小勾,0.1直線 
            a+=0.01;
            
            //Taget Image作用           
            vec2 V = (-1.0)*M(P.xy).xy;             //讀取MotionMap資訊的RG色版，分別代表XY軸速度
            
            // 決定下一個位置，可影響運動軌跡
            vec2 newPos= P.xy+ 0.5*V.xy + 1.*CS(3.*gnoise(0.01*P.xy));  //target image
            
            O = vec4(newPos,mod(a,6.2832),P.w-0.5);         // move head, P.w儲存每個粒子的生命age
            
            //設定死亡條件
            if  ( O.x<0.|| O.x>R.x || O.y<0.|| O.y>R.y )  { O.w = 0.;} // 若超過邊界，生命age歸零
            if  ( O.w <= 0.9 )  { O.w = 0.; }
            if  ( T(P.xy+(r+2.)*CS(a)).w >= 1. )  { O.w = 0.;} // 若碰撞其它粒子，生命age歸零              
        }
    }
    gl_FragColor=O;
}
