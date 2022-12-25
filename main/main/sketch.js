// shader
let pBuf
let _gl, gl
let theShader
const NUM = 100
const POINT_NUM = NUM * NUM
let positions = new Float32Array(POINT_NUM * 3)
let vel = 2
let win
let col_hue
let pool
let rad = 200
let arc = 0
let arcSpeed = 1
let randomRange = 1

// === Tone.js starts ===
// Lists to choose from
const arp_intervals = ["2n", "4n", "8n"]
// Random constants
const saw_detune = getRandomInt(16)+5; // 5~20
const wah_Q = getRandomInt(6) // 0~5
const arp_interval_index = getRandomInt(3) // 0~2
const BPM = 10 * ( 8 + getRandomInt(13)) // 80~200
//console.log(saw_detune,wah_Q,arp_intervals[arp_interval_index],BPM)
const volMute = -60;
let newchord = generateChords(5, 3)
// Generators
const poly_supersaw = [
  new Tone.FatOscillator(newchord[0][0], "sawtooth", saw_detune).toDestination(),
  new Tone.FatOscillator(newchord[0][1], "sawtooth", saw_detune).toDestination(),
  new Tone.FatOscillator(newchord[0][2], "sawtooth", saw_detune).toDestination(),
  new Tone.FatOscillator(newchord[0][3], "sawtooth", saw_detune).toDestination(),
  new Tone.FatOscillator(newchord[0][4], "sawtooth", saw_detune).toDestination(),
]
const piano = new Tone.Sampler({
	urls: {
		A1: "A1.mp3",
		A2: "A2.mp3",
    A3: "A3.mp3",
		A4: "A4.mp3",
    A5: "A5.mp3",
		A6: "A6.mp3",
    A7: "A7.mp3",
    C1: "C1.mp3",
		C2: "C2.mp3",
    C3: "C3.mp3",
		C4: "C4.mp3",
    C5: "C5.mp3",
		C6: "C6.mp3",
    C7: "C7.mp3",
	},
	baseUrl: "./salamander/",
}).toDestination();
piano.volume.value = -15;
//const subbass = new Tone.Oscillator("G2", "sine").toDestination().start();
const kick = new Tone.MembraneSynth({
  volume: -8,
  octaves: 3,
  envelope  : {
    sustain: 0.3,
  }
}).toDestination()
const bass = new Tone.Oscillator(newchord[2], "triangle").toDestination();
bass.volume.value = -15;
// Effecters
const lop = new Tone.Filter(20, "lowpass").toDestination();
const lowcut = new Tone.Filter(20000, "highpass").toDestination();
const reverb = new Tone.Freeverb().toDestination();
const stereoWidener = new Tone.StereoWidener(0.5).toDestination();
const allSideWidener = new Tone.StereoWidener(1).toDestination();
const allMiddler = new Tone.StereoWidener(0).toDestination();
const pingPong = new Tone.PingPongDelay("8n", 0.2).toDestination();
const autoWah = new Tone.AutoWah(50, 6, -30).toDestination();
autoWah.Q.value = wah_Q;

const synth = new Tone.Synth().toDestination();
const polySine = new Tone.PolySynth({
  // "volume": -10,
  "envelope": {
    "attack": 0,
    "decay": 0.3,
    "sustain": 0,
    "release": 0,
    }
}).toDestination()
polySine.volume.value = -20;
const pattern = new Tone.Pattern((time, note) => {
  polySine.triggerAttackRelease(note, "16n")
  piano.triggerAttackRelease(note, "1n")
  this.note = note
}, newchord[1], "randomWalk")
pattern.interval = arp_intervals[arp_interval_index];

Tone.Transport.bpm.value = BPM
Tone.Transport.timeSignature = 4

// Sidechain (One compress tWo)
const gainOne = new Tone.Gain(0.5).toDestination()
const gainTwo = new Tone.Gain(0.5).toDestination()
        
const signal = new Tone.Signal()
const follower = new Tone.Follower()

const sideChainRatio = 25

// Flip the values and shift them up by the max value of the sidechain signal
const negate = new Tone.Multiply(-sideChainRatio)
const shift = new Tone.Add(1)

kick.connect(gainOne).connect(allMiddler)

poly_supersaw.forEach((supersaw) => {
  supersaw.count = 3;
  supersaw.volume.value = volMute;
  supersaw.start();
  supersaw.connect(lowcut).connect(lop).connect(autoWah).connect(reverb).connect(stereoWidener).connect(gainTwo) ;
  supersaw.mute = true;
});

// Sidechain
kick.connect(follower)
follower.connect(signal)
signal.connect(negate)
negate.connect(shift)
shift.connect(gainTwo.gain)

polySine.connect(lop).connect(pingPong).connect(reverb).connect(allSideWidener)
piano.connect(lop).connect(pingPong).connect(reverb).connect(allSideWidener)
bass.connect(lop).connect(allMiddler)
// === Tone.js ends ===

function preload(){
    theShader = loadShader('shader.vert', 'shader.frag')
}

function setup() {
    _gl = createCanvas(windowWidth, windowHeight, WEBGL)
    angleMode(DEGREES)
    
    rad = 200 + random(0, 20)
    arc = random(0, 359)
    arcSpeed = 1 + random(-0.5, 0.5)
    // randomRange = 2
    // print(rad, arc, arcSpeed)

    gl = _gl.GL
    pool = new ParticlePool(NUM)
    shader(theShader)
    win = createVector(windowWidth/2, windowHeight/2)
}

function draw() {
    colorMode(HSB,360,100,100,100)
    background(0)

    // shader
    let col = color(col_hue, map(vel,0,10,0,100), 100)    
    theShader.setUniform("uCount", frameCount)  // custom uniform
    theShader.setUniform("uResolution", [width, height])  // custom uniform
    theShader.setUniform("uColor", [red(col)/255.0, green(col)/255.0, blue(col)/255.0])  // custom uniform
    if (mouseIsPressed) {
        vel = 10
        var f = forcePoint()
        pool.update(f.x, f.y)
    }
    else vel *= 0.95
    pool.move(vel)
    setVbo(POINT_NUM, pool.points)
    gl.drawArrays(gl.Points, 0, pBuf.model.vertices.length)
}

function startAction() {
  kick.triggerAttackRelease("C2", "4n")
  bass.volume.value = -15;
  bass.start()
  bass.frequency.rampTo(newchord[2]);
  poly_supersaw.forEach((supersaw,i) => {
    supersaw.start();
    supersaw.frequency.rampTo(newchord[0][i],0.1);
    supersaw.volume.value = -27;
  });
  
  lop.frequency.rampTo(20000, 0.1);

  pattern.values = newchord[1]
  piano.volume.value = -15;
  polySine.volume.value = -20;
  pattern.start()
  Tone.Transport.start()
}
  
function stopAction() {
  lop.frequency.rampTo(20, 0.1);
  bass.volume.value = volMute;
  bass.stop()
  poly_supersaw.forEach((supersaw) => {
    supersaw.volume.value = volMute;
    // supersaw.mute = true;
  });  
  piano.volume.value = volMute;
  polySine.volume.value = volMute;
  pattern.stop()
  Tone.Transport.stop()
  newchord = generateChords(5, 3)
}
  
// function mousePressed(){
//     col_hue = random(0, 360);
//     startAction();
// }
  
// function mouseReleased(){
//     stopAction();
// }

function touchStarted(){
    col_hue = random(0, 360)
    startAction();
}

function touchEnded(){
    stopAction();
}