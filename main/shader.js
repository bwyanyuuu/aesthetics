/* Initialize vertex positions and vector */
function initPositionsAndVectors(){
    let x, y;
    for(let i = 0; i < POINT_NUM; i++){
      x = map(i%NUM, 0, NUM-1, width/2-250, width/2+250);
      y = map((i/NUM)%NUM, 0, NUM-1, height/2-250, height/2+250);
      positions[i*3] = x;
      positions[i*3+1] = y;
      positions[i*3+2] = 0;
      vec[i*3] = 0;
      vec[i*3+1] = 0;
      vec[i*3+2] = 0;
    }
}
  
/* Update vector from vertex position, mouse position and previous vector
(vertex の座標・速度ベクトルとマウス座標を元に速度ベクトルを更新) */
function updateVector(x, y){
    for(let i = 0; i < POINT_NUM; i++){
        let d = sqrt(sq(x - positions[i*3]) + sq(y - positions[i*3+1])) * 5;
        let vx = (x - positions[i*3]) / d;
        let vy = (y - positions[i*3+1]) / d;
        vx += vec[i*3];
        vy += vec[i*3+1];
        d = sqrt(sq(vx) + sq(vy));
        vec[i*3] = vx / d;
        vec[i*3+1] = vy / d;
    }
}
  
/* Move vertex from vector and velocity */
function movePositions(){
    for(let i = 0; i < POINT_NUM; i++){
      positions[i*3] += vec[i*3] * vel;
      positions[i*3+1] += vec[i*3+1] * vel;
    }
  }
  
/* Pass vertex positions via vbo to vertex shader, and draw */
function setVbo(num){
    /* Create vbo (vertex buffer object), manually (直接 vbo を作成する) */
    const gId = `myPoints|${num}`;
    if(!this._renderer.geometryInHash(gId)){
        const myPointsGeom = new p5.Geometry();
        let v = createVector();
        for(let i = 0; i < num; i++){
            myPointsGeom.vertices.push(v.copy());
        }
        pBuf = this._renderer.createBuffers(gId, myPointsGeom);
    }
  
    /* Set attributes as dynamic, manually (直接 vbo を動的に変更できるようにする) */
    _gl._setPointUniforms(theShader);
    _gl._bindBuffer(_gl.immediateMode.buffers.point, gl.ARRAY_BUFFER,
                    _gl._vToNArray(pBuf.model.vertices), Float32Array, gl.DYNAMIC_DRAW);
    theShader.enableAttrib(theShader.attributes.aPosition, 3);
  
      /* Pass vertex positions via vbo to vertex shader (頂点座標を渡す)  */
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);
}

let rad = 200;
let arc = 0;
let arcSpeed = 1;
let two_pi = 6.28318530718
var randomRange = 1
function forcePoint(){
    arc += arcSpeed
    if(arc > 360) arc -= 360
    return createVector(cos(arc) + random(-randomRange, randomRange), sin(arc) + random(-randomRange, randomRange)).mult(rad).add(win)
}
  
//   function keyPressed(){
//     save("img_" + month() + '-' + day() + '_' + hour() + '-' + minute() + '-' + second() + ".jpg");
//   }