/**
 * UNIDAD 6: Agentes Autónomos - Instrumento Visual VJ PRO (Edición Definitiva "EASY")
 * Controles: 
 * [1-7] Modos Físicos | [E] Formar "EASY" | [G] Colores Arcoíris | [C] Ciclo Fondo 
 * [P] Color Fijo | [A] Pulso | [J] Jitter | [Clic] Invertir Contraste
 */

let boids = [];
const NUM_BOIDS = 160; 

let currentState = 1;
let trailFade = 25; 
let randomColorMode = false; 

// Paletas de color globales
let bgPalette = [[260, 80, 5], [240, 90, 10], [0, 0, 20], [0, 0, 95], [330, 80, 90]]; 
let currentBGIndex = 0;

let boidPalette = [[180, 90, 100], [60, 100, 100], [300, 100, 100], [0, 0, 0], [240, 100, 100]]; 
let currentBoidIndex = 0;

let targetBGColor;
let targetBoidColor;

// Puntos objetivos para formar la palabra EASY de forma impecable
let easyTargets = [];

let config = {
  1: { name: "1. Groove (Malla)", sep: 1.5, ali: 1.0, coh: 1.0, maxSpeed: 4, maxForce: 0.1 },
  2: { name: "2. Explosión (Caos)", sep: 6.0, ali: -0.5, coh: 0.0, maxSpeed: 10, maxForce: 0.8 },
  3: { name: "3. Órbita (Mouse)", sep: 3.5, ali: 1.0, coh: 0.5, maxSpeed: 7, maxForce: 0.4 },
  4: { name: "4. Esfera Energética", sep: 3.0, ali: 0.8, coh: 1.5, maxSpeed: 6, maxForce: 0.5 },
  5: { name: "5. Estático Neón", sep: 1.5, ali: 1.0, coh: 1.0, maxSpeed: 5, maxForce: 0.2 },
  6: { name: "6. Supernova (Fuegos Artificiales)", sep: 1.0, ali: 0.0, coh: 0.0, maxSpeed: 12, maxForce: 1.0 },
  7: { name: "7. El Tornado", sep: 2.0, ali: 0.6, coh: 0.3, maxSpeed: 8, maxForce: 0.5 },
  8: { name: "8. EASY (Tipografía)", sep: 0.5, ali: 0.2, coh: 0.2, maxSpeed: 8, maxForce: 0.6 } // Modo EASY
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  
  targetBGColor = color(bgPalette[currentBGIndex]);
  targetBoidColor = color(boidPalette[currentBoidIndex]);

  for (let i = 0; i < NUM_BOIDS; i++) {
    boids.push(new Boid(random(width), random(height)));
  }
  
  generateEasyPoints();
  background(targetBGColor);
}

// Generador de puntos vectoriales para la palabra EASY
function generateEasyPoints() {
  easyTargets = [];
  let numPointsPerLetter = floor(NUM_BOIDS / 4);
  
  let startX = width / 2 - 320;
  let startY = height / 2;
  
  // Letra E
  for (let i = 0; i < numPointsPerLetter; i++) {
    let t = i / numPointsPerLetter;
    let px, py;
    if (t < 0.4) { px = startX; py = startY + map(t, 0, 0.4, -80, 80); } // Línea vertical
    else if (t < 0.6) { px = startX + map(t, 0.4, 0.6, 0, 70); py = startY - 80; } // Arriba
    else if (t < 0.8) { px = startX + map(t, 0.6, 0.8, 0, 50); py = startY; } // Centro
    else { px = startX + map(t, 0.8, 1.0, 0, 70); py = startY + 80; } // Abajo
    easyTargets.push(createVector(px, py));
  }
  
  // Letra A
  startX += 130;
  for (let i = 0; i < numPointsPerLetter; i++) {
    let t = i / numPointsPerLetter;
    let px, py;
    if (t < 0.45) { px = startX + map(t, 0, 0.45, 0, 35); py = startY + 80 - map(t, 0, 0.45, 0, 160); }
    else if (t < 0.9) { px = startX + map(t, 0.45, 0.9, 35, 70); py = startY - 80 + map(t, 0.45, 0.9, 0, 160); }
    else { px = startX + 20; py = startY; } // Barra central
    easyTargets.push(createVector(px, py));
  }
  
  // Letra S
  startX += 130;
  for (let i = 0; i < numPointsPerLetter; i++) {
    let angle = map(i, 0, numPointsPerLetter, -PI, PI);
    let px = startX + 35 + sin(angle * 1.5) * 35;
    let py = startY + sin(angle) * 80;
    easyTargets.push(createVector(px, py));
  }
  
  // Letra Y
  startX += 120;
  for (let i = 0; i < numPointsPerLetter; i++) {
    let t = i / numPointsPerLetter;
    let px, py;
    if (t < 0.5) { px = startX + map(t, 0, 0.5, 0, 35); py = startY - 80 + map(t, 0, 0.5, 0, 80); }
    else if (t < 0.8) { px = startX + map(t, 0.5, 0.8, 70, 35); py = startY - 80 + map(t, 0.5, 0.8, 0, 80); }
    else { px = startX + 35; py = startY + map(t, 0.8, 1.0, 0, 80); }
    easyTargets.push(createVector(px, py));
  }
}

function draw() {
  let c = color(hue(targetBGColor), saturation(targetBGColor), brightness(targetBGColor), trailFade);
  background(c);

  let currentCfg = config[currentState];

  for (let i = 0; i < boids.length; i++) {
    let boid = boids[i];
    boid.flock(boids, currentCfg);
    
    // ESTADO 3: Órbita del Mouse
    if (currentState === 3) {
      let mouse = createVector(mouseX, mouseY);
      let dToMouse = p5.Vector.dist(boid.pos, mouse);
      if (dToMouse > 60) {
        let steer = boid.seek(mouse);
        steer.mult(1.2);
        boid.applyForce(steer);
      }
    }
    
    // ESTADO 4: Esfera Energética
    if (currentState === 4) {
      let center = createVector(width / 2, height / 2);
      let toCenter = p5.Vector.sub(center, boid.pos);
      let d = toCenter.mag();
      if (d > 100) {
        toCenter.setMag(currentCfg.maxSpeed);
        let steer = p5.Vector.sub(toCenter, boid.vel);
        steer.limit(currentCfg.maxForce);
        boid.applyForce(steer);
      } else {
        let angleToCenter = toCenter.heading();
        let sphereOrbit = p5.Vector.fromAngle(angleToCenter + HALF_PI);
        sphereOrbit.mult(currentCfg.maxSpeed);
        let steer = p5.Vector.sub(sphereOrbit, boid.vel);
        steer.limit(currentCfg.maxForce * 1.5);
        boid.applyForce(steer);
      }
    }

    // ESTADO 6: Supernova (Fuegos Artificiales)
    if (currentState === 6) {
      let center = createVector(width / 2, height / 2);
      let d = p5.Vector.dist(boid.pos, center);
      if (d < 40) {
        let explosion = p5.Vector.sub(boid.pos, center);
        explosion.normalize();
        explosion.mult(random(15, 25)); 
        boid.vel = explosion; 
      } else {
        let pull = p5.Vector.sub(center, boid.pos);
        pull.normalize();
        pull.mult(3);
        boid.applyForce(pull);
      }
    }

    // ESTADO 7: El Tornado
    if (currentState === 7) {
      let center = createVector(width / 2, boid.pos.y); 
      let toCenter = p5.Vector.sub(center, boid.pos);
      let tornadoForce = createVector(toCenter.x * 0.05, -0.8);
      tornadoForce.limit(currentCfg.maxForce * 2);
      boid.applyForce(tornadoForce);
    }

    // ESTADO 8: Formar la palabra EASY
    if (currentState === 8 && easyTargets.length > 0) {
      let targetIndex = i % easyTargets.length;
      let target = easyTargets[targetIndex];
      let steer = boid.seek(target);
      steer.mult(1.5);
      boid.applyForce(steer);
    }
    
    boid.update();
    boid.edges();
  }

  // RENDERIZADO VISUAL PRO (Plexus Neón)
  drawingContext.shadowBlur = 15;

  for (let i = 0; i < boids.length; i++) {
    let b1 = boids[i];
    
    let renderColor = targetBoidColor;
    if (randomColorMode) {
      let speed = b1.vel.mag();
      let dynHue = (b1.baseHue + speed * 15) % 360;
      renderColor = color(dynHue, 90, 100, 90);
    }
    
    drawingContext.shadowColor = renderColor;
    stroke(renderColor);
    
    let connectionsMade = 0; 
    let connectionDistance = currentState === 8 ? 50 : 80;

    for (let j = i + 1; j < boids.length; j++) {
      if (connectionsMade > 4) break; 
      
      let b2 = boids[j];
      let dx = b1.pos.x - b2.pos.x;
      let dy = b1.pos.y - b2.pos.y;
      let dSq = dx * dx + dy * dy;
      
      if (dSq < connectionDistance * connectionDistance) {
        let d = sqrt(dSq);
        let alphaLine = map(d, 0, connectionDistance, 90, 0);
        let cLine = color(hue(renderColor), saturation(renderColor), brightness(renderColor), alphaLine);
        stroke(cLine);
        strokeWeight(map(d, 0, connectionDistance, 3, 0.5));
        line(b1.pos.x, b1.pos.y, b2.pos.x, b2.pos.y);
        connectionsMade++;
      }
    }
    
    push();
    translate(b1.pos.x, b1.pos.y);
    rotate(b1.vel.heading());
    fill(renderColor);
    noStroke();
    triangle(-6, -4, 10, 0, -6, 4);
    pop();
  }

  drawingContext.shadowBlur = 0;
  
  // HUD
  fill(255 - brightness(targetBGColor)); 
  noStroke();
  textSize(14);
  text(`ESTADO VJ: ${currentCfg.name} | [E] EASY Mode`, 20, 30);
  textSize(11);
  text(`[1-7] Modos | [E] EASY | [G] Arcoíris | [C] Fondo | [P] Fijo | [A] Pulso | [J] Jitter | [Clic] Invertir`, 20, 52);
}

function keyPressed() {
  if (key >= '1' && key <= '7') currentState = parseInt(key);
  
  // Tecla E: Activar formación de la palabra EASY
  if (key === 'e' || key === 'E') {
    currentState = 8;
  }
  
  if (key === 'g' || key === 'G') {
    randomColorMode = !randomColorMode;
  }
  
  if (key === 'c' || key === 'C') {
    currentBGIndex = (currentBGIndex + 1) % bgPalette.length;
    targetBGColor = color(bgPalette[currentBGIndex]);
  }
  
  if (key === 'p' || key === 'P') {
    randomColorMode = false;
    currentBoidIndex = (currentBoidIndex + 1) % boidPalette.length;
    targetBoidColor = color(boidPalette[currentBoidIndex]);
  }
  
  if (key === 'a' || key === 'A') {
    trailFade = trailFade === 25 ? 80 : 25; 
  }
  
  if (key === 'j' || key === 'J') {
    for (let boid of boids) {
      let randomKick = p5.Vector.random2D().mult(random(10, 20));
      boid.applyForce(randomKick);
      boid.baseHue = random(360);
    }
  }
}

function mousePressed() {
  let originalBG = targetBGColor;
  let originalBoid = targetBoidColor;
  let newB = brightness(originalBG) > 50 ? 0 : 100;
  targetBGColor = color(hue(originalBG), saturation(originalBG), newB);
  targetBoidColor = color(hue(originalBoid), saturation(originalBoid), 100 - brightness(originalBoid));
}

function mouseReleased() {
  targetBGColor = color(bgPalette[currentBGIndex]);
  targetBoidColor = color(boidPalette[currentBoidIndex]);
}

class Boid {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.vel.setMag(random(2, 4));
    this.acc = createVector(0, 0);
    this.baseHue = random(360);
  }

  flock(boids, cfg) {
    let perceptionRadius = 60;
    let sepRadius = 35;
    let sep = createVector(0, 0);
    let ali = createVector(0, 0);
    let coh = createVector(0, 0);
    let totalAliCoh = 0;
    let totalSep = 0;
    
    for (let other of boids) {
      if (other !== this) {
        let dx = this.pos.x - other.pos.x;
        let dy = this.pos.y - other.pos.y;
        let dSq = dx * dx + dy * dy;
        if (dSq < perceptionRadius * perceptionRadius) {
          ali.add(other.vel);
          coh.add(other.pos);
          totalAliCoh++;
          if (dSq < sepRadius * sepRadius) {
            let diff = p5.Vector.sub(this.pos, other.pos);
            diff.div(dSq); 
            sep.add(diff);
            totalSep++;
          }
        }
      }
    }
    if (totalAliCoh > 0) {
      ali.div(totalAliCoh);
      ali.setMag(cfg.maxSpeed);
      ali.sub(this.vel);
      ali.limit(cfg.maxForce);
      coh.div(totalAliCoh);
      let desired = p5.Vector.sub(coh, this.pos);
      desired.setMag(cfg.maxSpeed);
      coh = p5.Vector.sub(desired, this.vel);
      coh.limit(cfg.maxForce);
    }
    if (totalSep > 0) {
      sep.div(totalSep);
      sep.setMag(cfg.maxSpeed);
      sep.sub(this.vel);
      sep.limit(cfg.maxForce);
    }
    sep.mult(cfg.sep);
    ali.mult(cfg.ali);
    coh.mult(cfg.coh);
    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.pos);
    let d = desired.mag();
    if (d > 0) {
      desired.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxForce);
      return steer;
    }
    return createVector(0, 0);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  edges() {
    if (this.pos.x > width + 50) this.pos.x = -50;
    else if (this.pos.x < -50) this.pos.x = width + 50;
    if (this.pos.y > height + 50) this.pos.y = -50;
    else if (this.pos.y < -50) this.pos.y = height + 50;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  targetBGColor = color(bgPalette[currentBGIndex]);
  background(targetBGColor);
  generateEasyPoints();
}