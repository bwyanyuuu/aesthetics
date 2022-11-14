var particles = []
var frame = 0

var circle_partMax = 8
var circle_partMin = 2
var circle_part = circle_partMin // (2, 8, 5, 1)
var circle_partTurn = false
var circle_partActive = false
var circle_speed = 0.2 // (0.1, 1, 0.1, 0.05)
var circle_radius = 90
var button_tune
var button_drum
var tune_active = false
var drum_active = false
// need to be distory
var button_tunePatch
var button_drumPatch
var filter
var bpm
function setup() {
    createCanvas(windowWidth, windowHeight)
    angleMode(DEGREES)
    button_tune = new Button(windowWidth*0.1, windowHeight*0.9, 30)
    button_drum = new Button(windowWidth*0.2, windowHeight*0.9, 30)
    // need to be distory
    button_tunePatch = new Button(windowWidth*0.1, windowHeight*0.8, 30)
    button_drumPatch = new Button(windowWidth*0.2, windowHeight*0.8, 30)
    filter = createSlider(0, 360, 327, 1).position(windowWidth*0.4, windowHeight*0.9)
    bpm = createSlider(0, 220, 160, 1).position(windowWidth*0.6, windowHeight*0.9)
}

function draw() {
    colorMode(RGB)
    background(30)

    // panel
    button_tune.display(mouseX, mouseY)
    button_drum.display(mouseX, mouseY)
    // need to be distory
    button_tunePatch.display(mouseX, mouseY)
    button_drumPatch.display(mouseX, mouseY)

    translate(width / 2, height / 2)
    colorMode(HSB, 360, 100, 100)
    // particles
    if(tune_active){
        for(var i = 0; i < 1; i++){
            p = new Particle(0, circle_radius, 0)
            particles.push(p)
        }
        if(frame > 0){
            for(var i = 0; i < 20; i++){
                p = new Particle(1, circle_radius, filter.value())
                particles.push(p)
            }
            frame--
        }

        for(var i = 0; i < particles.length; i++){
            if(particles[i].a > 0){
                particles[i].update(filter.value())
                particles[i].show()
            }
            else{
                particles.splice(i, 1)
            }
        }
    }

    // circles
    if(drum_active){
    
        noFill()
        strokeWeight(1)
        
        for(var n = 0; n < 6; n++){
            stroke(filter.value(), 30, 100)
            beginShape()
            for(var i = 0; i < 360; i += 3){
                var rad = map(sin(i * circle_part + frameCount), -1, 1, circle_radius - 30, circle_radius)
                var x = rad * cos(i)
                var y = rad * sin(i)
                vertex(x, y)
            }
            endShape(CLOSE)
            rotate(frameCount * circle_speed)
        }
        if(circle_partActive && circle_part == circle_partMin){
            circle_partActive = false
            circle_partTurn = false
        }
        else if(circle_partActive){
            if(!circle_partTurn && circle_part < circle_partMax) circle_part += 1
            if(!circle_partTurn && circle_part == circle_partMax) circle_partTurn = true
            else if(circle_partTurn && circle_part > circle_partMin) circle_part -= 1

        }
    }
    // console.log(circle_part, circle_partActive, circle_partTurn)
    // con

}

function mouseClicked(){
    
    // console.log('pressed')
    if(button_tune.contains(mouseX, mouseY)){
        button_tune.switchColor()
        tune_active = ~tune_active
        Pd.start()
        Pd.send('start', [1])
    }
    if(button_tunePatch.contains(mouseX, mouseY)){
        button_tunePatch.switchColor()
        frame = 6
    }
    if(button_drum.contains(mouseX, mouseY)){
        button_drum.switchColor()
        drum_active = ~drum_active
    }
    if(button_drumPatch.contains(mouseX, mouseY)){
        button_drumPatch.switchColor()
        circle_partActive = true
        circle_part += 1
    }
    // Pd.send('freq', [parseFloat($('#freqInput').val())])

    Pd.receive('haha', function(args) {
        outMidiNo = args*1.0;
        frame = 1
        // dispfreq = "Frequency：" + Math.floor(args*100)/100 + " Hz";
        // document.getElementById("pdMidi").innerHTML = dispfreq;
        
        // polySynth.play(outMidiNo, 0.3, 0, 0.2);
        // polySynth.play(outMidiNo*6, 0.4, 0.2, 0.6);
        // delay.process(polySynth, 0.32, .5, 2300);
      });
    
}