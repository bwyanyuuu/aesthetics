// shader
let pBuf
let _gl, gl
let theShader
const NUM = 100
const POINT_NUM = NUM * NUM
let positions = new Float32Array(POINT_NUM * 3)
let vec = new Float32Array(POINT_NUM * 3)
let vel = 2
let win
let col_hue

// === Tone.js starts ===
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  const progressionIndex = getRandomInt(chordProgressionList.length)
  const chordProgression = chordProgressionList[progressionIndex]
  const Arp = arpList[progressionIndex]
  let currentChord = 0;
  const volMute = -50;
  const saw_detune = getRandomInt(20)+1; //10
  console.log("supersaw detune: ", saw_detune);
  const poly_supersaw = [
    new Tone.FatOscillator(chordProgression[0][0], "sawtooth", saw_detune).toDestination(),
    new Tone.FatOscillator(chordProgression[0][1], "sawtooth", saw_detune).toDestination(),
    new Tone.FatOscillator(chordProgression[0][2], "sawtooth", saw_detune).toDestination(),
    new Tone.FatOscillator(chordProgression[0][3], "sawtooth", saw_detune).toDestination(),
    new Tone.FatOscillator(chordProgression[0][4], "sawtooth", saw_detune).toDestination(),
  ]
  const piano = new Tone.Sampler({
      urls: {
          A1: "A1.mp3",
          A2: "A2.mp3",
      },
      baseUrl: "https://tonejs.github.io/audio/salamander/",
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
  
  const sub_highcut = new Tone.Filter(200, "lowpass").toDestination();
  const lop = new Tone.Filter(20, "lowpass").toDestination();
  const lowcut = new Tone.Filter(20000, "highpass").toDestination();
  const reverb = new Tone.Freeverb().toDestination();
  const stereoWidener = new Tone.StereoWidener(0.5).toDestination();
  const allSideWidener = new Tone.StereoWidener(1).toDestination();
  const pingPong = new Tone.PingPongDelay("8n", 0.2).toDestination();
  const dist = new Tone.Distortion(0.8).toDestination();
  
  const synth = new Tone.Synth().toDestination();
  const polySine = new Tone.PolySynth(Tone.Synth).toDestination()
  polySine.volume.value = -20;
  const pattern = new Tone.Pattern((time, note) => {
    polySine.triggerAttackRelease(note, "16n")
    piano.triggerAttackRelease(note, "1n")
    this.note = note
  }, Arp[currentChord], "randomOnce")
  pattern.interval = "8n";
  
  Tone.Transport.bpm.value = 160
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
  
  kick.connect(gainOne)     
  
  poly_supersaw.forEach((supersaw) => {
    supersaw.count = 3;
    supersaw.volume.value = volMute;
    supersaw.start();
    supersaw.connect(lowcut).connect(lop).connect(reverb).connect(stereoWidener).connect(gainTwo) ;
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
  
  // === Tone.js ends ===

function preload(){
    theShader = loadShader('shader.vert', 'shader.frag')
}

function setup() {
    _gl = createCanvas(windowWidth, windowHeight, WEBGL)
    angleMode(DEGREES)
    
    gl = _gl.GL
	initPositionsAndVectors()
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
        updateVector(f.x, f.y)
    }
    else vel *= 0.95
    movePositions()
    setVbo(POINT_NUM)
    gl.drawArrays(gl.Points, 0, pBuf.model.vertices.length)
}

function startAction() {
    kick.triggerAttackRelease("C2", "4n")
    poly_supersaw.forEach((supersaw,i) => {
      supersaw.start();
      supersaw.frequency.rampTo(chordProgression[currentChord][i],0.1);
      supersaw.volume.value = -25;
  });
    
    lop.frequency.rampTo(20000, 0.1);
    
    piano.volume.value = -15;
    polySine.volume.value = -20;
    pattern.start()
    Tone.Transport.start()
}
  
function stopAction() {
    lop.frequency.rampTo(20, 0.1);
    
    poly_supersaw.forEach((supersaw,i) => {
      supersaw.volume.value = volMute;
  });
    currentChord = (currentChord + 1) % chordProgression.length;
    
    piano.volume.value = volMute;
    polySine.volume.value = volMute;
    pattern.stop()
    Tone.Transport.stop()
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