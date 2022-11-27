class Particle{
    constructor(rad, hue){
        this.pos = p5.Vector.random2D().mult(rad)
        this.vel = this.pos.copy().normalize().mult(4)

        this.r = hue
        this.g = 0
        this.b = 100
        this.a = 255
    }
    update(hue){
        this.pos.add(this.vel)
        
        // gradient from white to color
        this.r = hue
        this.g = map(this.a, 0, 255, 0, 73)
        this.b = map(this.a, 0, 255, 100, 93)
        
        this.a -= 5
    }
    show(){
        noStroke()
        fill(this.r, this.g, this.b, this.a)
        ellipse(this.pos.x, this.pos.y, 3)
    }
}

class Particle2{
    constructor(x, y){
        this.pos = createVector(x, y)
        this.vel = p5.Vector.random2D().mult(3)
        this.a = 255;
    }
    update(){
        this.pos.add(this.vel)
        this.a -= 5
    }
    show(){
        noStroke()
        fill(0, 0, 100)
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
        this.rr = 230;
        this.gg = 230;
        this.bb = 230;
    }
    
    contains(mx, my) {
        return dist(mx, my, this.x, this.y) < this.r;
    }
    
    switchColor(){
        if(this.active){
            this.rr = 230;
            this.gg = 230;
            this.bb = 230;
            this.active = false;
        }
        else{
            this.rr = 180;
            this.gg = 180;
            this.bb = 180;
            this.active = true;
        }
    }
    
    display(mx, my) {
        colorMode(RGB)
        stroke(255, 255, 255);
        strokeWeight(2);
        if(this.contains(mx, my)) fill(this.rr, this.gg, this.bb, 200);
        else fill(this.rr, this.gg, this.bb);
        ellipse(this.x, this.y, this.r);
        noStroke();
    }
}