var particles = []
var particles2 = []
var frame = 0
var particles2_spawn = false

var circle_partMax = 8
var circle_partMin = 2
var circle_part = circle_partMin
var circle_partTurn = false
var circle_partActive = false
var circle_speed = 0.2
var circle_radius = 70
var button_tune
var button_drum
var button_play
var play_active = false
var tune_active = false
var drum_active = false
var smallDrum_active = false
var filter
var filter_value
var filter_color
var bpm
var bpm_value = 0

function setup() {
    createCanvas(windowWidth, windowHeight)
    angleMode(DEGREES)
    p1 = createP('Play').position(windowWidth*0.1 - 20, windowHeight*0.89)
    button_play = new Button(windowWidth*0.1, windowHeight*0.88, 30)
    p2 = createP('Melody').position(windowWidth*0.2 - 30, windowHeight*0.89)
    button_tune = new Button(windowWidth*0.2, windowHeight*0.88, 30)
    p3 = createP('Drum').position(windowWidth*0.3 - 25, windowHeight*0.89)
    button_drum = new Button(windowWidth*0.3, windowHeight*0.88, 30)
    p4 = createP('Filter').position(windowWidth*0.4 + 45, windowHeight*0.89)
    filter = createSlider(100, 2000, 327, 1).position(windowWidth*0.4, windowHeight*0.88)
    p6 = createP('Speed').position(windowWidth*0.6 + 45, windowHeight*0.89)
    bpm = createSlider(130, 360, 200, 1).position(windowWidth*0.6, windowHeight*0.88)
}

function draw() {
    colorMode(RGB)
    background(30)

    // panel
    button_play.display(mouseX, mouseY)
    button_tune.display(mouseX, mouseY)
    button_drum.display(mouseX, mouseY)

    translate(width / 2, height / 2)
    colorMode(HSB, 360, 100, 100)

    // particles
    if(tune_active){
        if(frame > 0){
            for(var i = 0; i < 50; i++){
                p = new Particle(circle_radius, filter_color)
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

    if(smallDrum_active){
        if(particles2_spawn){
            var x = random(-width / 3, width / 3)
            var y = random(-height / 3, height / 3)
            // print(x, y)
            for(var i = 0; i < 50; i++){
                p = new Particle2(x + random(-5, 5), y + random(-5, 5))
                particles2.push(p)
            }
            particles2_spawn = false
        }        
        for(var i = 0; i < particles2.length; i++){
            if(particles2[i].a > 0){
                particles2[i].update(filter_color)
                particles2[i].show()
            }
            else{
                particles2.splice(i, 1)
            }
        }
    }

    // circles
    if(drum_active){
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
    
    // sliders
    if(bpm.value() != bpm_value){
        bpm_value = bpm.value()
        Pd.send('speed', [360-bpm_value+130])
        // console.log("bpm", bpm_value, 360-bpm_value+130)
    }

    if(filter.value() != filter_value){
        filter_value = filter.value()
        filter_color = map(filter_value, 100, 2000, 0, 360)
        Pd.send('filter', [filter_value])
        // console.log("filter", filter_value)
    }
}

function mouseClicked(){
    if(button_play.contains(mouseX, mouseY)){
        if(!play_active){
            button_play.switchColor()
            Pd.start()
            // console.log("play start")
            tune_active = true
            drum_active = true
            play_active = true
            smallDrum_active = true
        }
    }
    
    if(button_tune.contains(mouseX, mouseY)){
        button_tune.switchColor()
        // console.log("tune", tune_active)
        if(!tune_active) Pd.send('melody_switch', [1])
        else Pd.send('melody_switch', [0])
        tune_active = !tune_active
        
    }
    
    if(button_drum.contains(mouseX, mouseY)){
        button_drum.switchColor()
        if(!drum_active) Pd.send('drum_switch', [1])
        else Pd.send('drum_switch', [0])
        drum_active = !drum_active
        smallDrum_active = !smallDrum_active
    }

    Pd.receive('haha', function(args) {
        outMidiNo = args*1.0;
        frame = 1
    })

    Pd.receive('drum', function(args) {
        outMidiNo = args*1.0;
        if(!circle_partActive) circle_part += 2
        circle_partActive = true
        
    })

    Pd.receive('snare', function(args) {
        outMidiNo = args*1.0;
        particles2_spawn = true
        
    })
}