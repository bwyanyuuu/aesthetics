class Particle{
    constructor(i){
        let x, y
        x = map(i%NUM, 0, NUM-1, width/2-250, width/2+250);
        y = map((i/NUM)%NUM, 0, NUM-1, height/2-250, height/2+250);
        this.pos = createVector(x, y)
        this.vec = createVector(0, 0)
        this.idx = i
    }
    update(x, y){
        let d = sqrt(sq(x - this.pos.x) + sq(y - this.pos.y)) * 5;
        let ax = (x - this.pos.x) / d
        let ay = (y - this.pos.y) / d
        ax += this.vec.x
        ay += this.vec.y
        d = sqrt(sq(ax) + sq(ay));
        this.vec.x = ax / d
        this.vec.y = ay / d
    }
    move(array, vel){
        this.pos.x += this.vec.x * vel
        this.pos.y += this.vec.y * vel
        array[this.idx * 3] = this.pos.x
        array[this.idx * 3 + 1] = this.pos.y
    }
}

class ParticlePool{
    constructor(num){
        this.num = num
        this.total = num * num
        this.particles = []
        for(let i = 0; i < this.total; i++){
            var p = new Particle(i)
            this.particles.push(p)
            positions[i * 3 + 2] = 0
        }
    }
    update(x, y){
        for(let i = 0; i < this.total; i++){
            this.particles[i].update(x, y)
        }
    }
    move(vel){
        for(let i = 0; i < this.total; i++){
            this.particles[i].move(positions, vel)
        }
    }
}
  
function setVbo(num){
    const gId = `myPoints|${num}`;
    if(!this._renderer.geometryInHash(gId)){
        const myPointsGeom = new p5.Geometry();
        let v = createVector();
        for(let i = 0; i < num; i++){
            myPointsGeom.vertices.push(v.copy());
        }
        pBuf = this._renderer.createBuffers(gId, myPointsGeom);
    }
  
    _gl._setPointUniforms(theShader);
    _gl._bindBuffer(_gl.immediateMode.buffers.point, gl.ARRAY_BUFFER,
                    _gl._vToNArray(pBuf.model.vertices), Float32Array, gl.DYNAMIC_DRAW);
    theShader.enableAttrib(theShader.attributes.aPosition, 3);
  
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);
}

let rad = 200
let arc = 0
let arcSpeed = 1
let randomRange = 1
function forcePoint(){
    arc += arcSpeed
    if(arc > 360) arc -= 360
    return createVector(cos(arc) + random(-randomRange, randomRange), sin(arc) + random(-randomRange, randomRange)).mult(rad).add(win)
}