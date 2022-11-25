var particles = []
var frame = 0

var circle_partMax = 8
var circle_partMin = 2
var circle_part = circle_partMin // (2, 8, 5, 1)
var circle_partTurn = false
var circle_partActive = false
var circle_speed = 0.2 // (0.1, 1, 0.1, 0.05)
var circle_radius = 70
var button_tune
var button_drum
var button_play
var play_active = false
var tune_active = false
var drum_active = false
// var button_tunePatch
// var button_drumPatch
var filter
var filter_value
var filter_color
var bpm
var bpm_value = 0
function setup() {
    createCanvas(windowWidth, windowHeight)
    angleMode(DEGREES)
    button_play = new Button(windowWidth*0.1, windowHeight*0.9, 30)
    button_tune = new Button(windowWidth*0.2, windowHeight*0.9, 30)
    button_drum = new Button(windowWidth*0.3, windowHeight*0.9, 30)
    // need to be distory
    // button_tunePatch = new Button(windowWidth*0.1, windowHeight*0.8, 30)
    // button_drumPatch = new Button(windowWidth*0.2, windowHeight*0.8, 30)
    filter = createSlider(100, 2000, 327, 1).position(windowWidth*0.4, windowHeight*0.9)
    bpm = createSlider(130, 360, 200, 1).position(windowWidth*0.6, windowHeight*0.9)
}

function draw() {
    colorMode(RGB)
    background(30)

    // panel
    button_play.display(mouseX, mouseY)
    button_tune.display(mouseX, mouseY)
    button_drum.display(mouseX, mouseY)
    // need to be distory
    // button_tunePatch.display(mouseX, mouseY)
    // button_drumPatch.display(mouseX, mouseY)

    translate(width / 2, height / 2)
    colorMode(HSB, 360, 100, 100)

    // particles
    if(tune_active){
        // for(var i = 0; i < 1; i++){
        //     p = new Particle(0, circle_radius, 0)
        //     particles.push(p)
        // }
        if(frame > 0){
            for(var i = 0; i < 50; i++){
                p = new Particle(1, circle_radius, filter_color)
                particles.push(p)
            }
            frame--
        }

        for(var i = 0; i < particles.length; i++){
            if(particles[i].a > 0){
                particles[i].update(filter_color)
                particles[i].show()
            }
            else{
                particles.splice(i, 1)
            }
        }
    }

    // circles
    if(drum_active){
        // console.log("drum")
        noFill()
        strokeWeight(1)
        
        for(var n = 0; n < 6; n++){
            stroke(filter_color, 30, 100)
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
            if(!circle_partTurn && circle_part < circle_partMax) circle_part += 2
            if(!circle_partTurn && circle_part == circle_partMax) circle_partTurn = true
            else if(circle_partTurn && circle_part > circle_partMin) circle_part -= 2

        }
    }
    // console.log(circle_part, circle_partActive, circle_partTurn)
    // con
    if(bpm.value() != bpm_value){
        bpm_value = bpm.value()
        Pd.send('speed', [360-bpm_value+130])
        console.log("bpm", bpm_value, 360-bpm_value+130)
    }
    if(filter.value() != filter_value){
        filter_value = filter.value()
        filter_color = map(filter_value, 100, 2000, 0, 360)
        Pd.send('filter', [filter_value])
        console.log("filter", filter_value)
    }

}

function mouseClicked(){
    
    if(button_play.contains(mouseX, mouseY)){
        if(!play_active){
            button_play.switchColor()
            Pd.start()
            console.log("play start")
            tune_active = true
            drum_active = true
            play_active = true
        }
    }
    // console.log('pressed')
    if(button_tune.contains(mouseX, mouseY)){
        button_tune.switchColor()
        console.log("tune", tune_active)
        if(!tune_active) Pd.send('melody_switch', [1])
        else Pd.send('melody_switch', [0])
        tune_active = !tune_active
        
    }
    // if(button_tunePatch.contains(mouseX, mouseY)){
    //     button_tunePatch.switchColor()
    //     frame = 6
    // }
    if(button_drum.contains(mouseX, mouseY)){
        button_drum.switchColor()
        if(!drum_active) Pd.send('drum_switch', [1])
        else Pd.send('drum_switch', [0])
        drum_active = !drum_active
    }
    // if(button_drumPatch.contains(mouseX, mouseY)){
    //     button_drumPatch.switchColor()
    //     circle_partActive = true
    //     circle_part += 1
    // }
    // Pd.send('freq', [parseFloat($('#freqInput').val())])

    Pd.receive('haha', function(args) {
        outMidiNo = args*1.0;
        frame = 1
    });
    Pd.receive('drum', function(args) {
        outMidiNo = args*1.0;
        if(!circle_partActive) circle_part += 2
        circle_partActive = true
        
    });
    
}