class Particle{
    constructor(mode, rad, hue){
        this.pos = p5.Vector.random2D().mult(rad)//createVector(rad * cos(t), rad * sin(t))
        this.vel = this.pos.copy().normalize().mult(4)//createVector(0, 0)
        this.acc = this.pos.copy().normalize().mult(0.2)// p5.Vector.random2D().normalize().mult(1.5)

        this.r = hue //map(this.pos.x, 0, width, 255, 0)
        this.g = 0 //map(this.pos.y, 0, height, 0, 255)
        this.b = 100 //map(dist(width / 2, height / 2, this.pos.x, this.pos.y), 0, width / 2, 0, 255)
        this.a = 255;

        this.mode = mode
    }
    update(hue){
        // var m = map(sin(frameCount * 6), -1, 1, 0.4, 0.6)
        // this.acc.mult(m)

        // this.vel.add(this.acc)
        this.pos.add(this.vel)
        
        // gradient from white to pink
        if(this.mode){
            this.r = hue//map(this.a, 0, 360, 321, 321)
            this.g = map(this.a, 0, 255, 0, 73)
            this.b = map(this.a, 0, 255, 100, 93)
        }

        if (dist(width / 2, height / 2, this.pos.x, this.pos.y) > 80){
            this.a -= 5
        }
    }
    show(){
        noStroke()
        // colorMode(HSB, 360, 100, 100)
        fill(this.r, this.g, this.b, this.a)
        // console.log(this.r)
        ellipse(this.pos.x, this.pos.y, 3)
    }
}

class Button {
    constructor(x_, y_, r_) {
        // Location and size
        this.x = x_;
        this.y = y_;
        this.r = r_;
        this.active = false;
        this.rr = 255;
        this.gg = 255;
        this.bb = 0;
    }
    // Is a point inside the doorbell? (used for mouse rollover, etc.)
    contains(mx, my) {
        // if(dist(mx, my, this.x, this.y) < this.r) console.log('contain')
        return dist(mx, my, this.x, this.y) < this.r;
    }
    
    switchColor(){
        if(this.active){
            this.rr = 255;
            this.gg = 255;
            this.bb = 0;
            this.active = false;
        }
        else{
            this.rr = 255;
            this.gg = 0;
            this.bb = 255;
            this.active = true;
        }
    }
    
    display(mx, my) {
        // 邊框
        colorMode(RGB)
        stroke(0, 0, 255);
        strokeWeight(2);
        // noStroke()

        // circle
        
        if(this.contains(mx, my)) fill(this.rr, this.gg, this.bb, 200);
        else fill(this.rr, this.gg, this.bb);
        // ellipseMode(RADIUS);
        ellipse(this.x, this.y, this.r);
        noStroke();
    }
}