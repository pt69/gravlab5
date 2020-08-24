//MIT-Lizenz: Copyright (c) 2018 Matthias Perenthaler
//
//Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//
//The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// Idee: Brian Cruz, http://justfound.co/gravity/

let local_frameRate = 60;
let gObjektArray = [];
let explosionsArray = [];

const sonnenRadius = 13;

let masse = 5; 
let gravitationsFaktor = 1;
let clusterFaktor = 20;
let clusterRotation = 0.02;
let deltaT = 0;
let animationsFaktor = 1;

let mouseInitX = 0;
let mouseInitY = 0;
let currentMouseX = 0;
let currentMouseY = 0;

let clusterStartX = 0;
let clusterStartY = 0;
let clusterPosAendern = false;

let einzelneMasseDazu = false;
let einzelneMasseDazuFaktor = 6;
let zentrieren = false;
let pause = false;
let shiftPressed = false;
let strgPressed = false;

function resetCanvas() {
    gObjektArray = [];
    explosionsArray = [];
    anpassungAnsicht.ansicht.x = 0;
    anpassungAnsicht.ansicht.y = 0;
    anpassungAnsicht.ansicht.zoom = 1;
    settings.setValue("Zoom", "Zoom mit Mausrad (x" + anpassungAnsicht.ansicht.zoom.toFixed(2) + ")");
}

const anpassungAnsicht = {
  ansicht: {x: 0, y: 0, zoom: 1},
  ansichtPos: { letztesX: null,  letztesY: null,  boolVerschieben: false },
}

function quadrupelSternSystem() {
    gObjektDazu(300, createVector(0, 30), createVector(width/2+200, height/2-180));
    massenCluster(width/2+200, height/2-180, 20, 0.02);
    gObjektDazu(400, createVector(0, -32), createVector(width/2-200, height/2-180));
    massenCluster(width/2-200, height/2-180, 20, -0.03);
    gObjektDazu(350, createVector(0, 29), createVector(width/2+200, height/2+180));
    massenCluster(width/2+200, height/2+180, 20, 0.02); 
    gObjektDazu(350, createVector(0, -31), createVector(width/2-200, height/2+180));
    massenCluster(width/2-200, height/2+180, 20, -0.03);    
}

function tripelSternSystem() {
    gObjektDazu(300, createVector(0, 30), createVector(width/2+200, height/2-80));
    massenCluster(width/2+200, height/2-80, 20, 0.02);
    gObjektDazu(400, createVector(0, -32), createVector(width/2-200, height/2-80));
    massenCluster(width/2-200, height/2-80, 20, -0.03);
    gObjektDazu(350, createVector(0, -29), createVector(width/2, height/2+200));
    massenCluster(width/2, height/2+200, 20, -0.02);    
}

function doppelSternSystem() {
    gObjektDazu(400, createVector(0, 30), createVector(width/2+200, height/2));
    massenCluster(width/2+200, height/2, 20, 0.02);
    gObjektDazu(400, createVector(0, -30), createVector(width/2-200, height/2));
    massenCluster(width/2-200, height/2, 20, -0.02);
}

function einzelSternSystem() {
    gObjektDazu(400, createVector(0, 1), createVector(width/2, height/2));
    massenCluster(width/2, height/2, 20, 0.02);
}


function system(auswahl) {
    if(auswahl.value === " ") {
        resetCanvas();
    }   
    if(auswahl.value === "Einzelsternsystem") {
        resetCanvas();
        einzelSternSystem();
    }   
    if(auswahl.value === "Doppelsternsystem") {
        resetCanvas();
        doppelSternSystem();
    }
    if(auswahl.value === "Tripelsystem") {
        resetCanvas();
        tripelSternSystem();
    }
    if(auswahl.value === "Quadrupelsystem") {
        resetCanvas();
        quadrupelSternSystem();
    }
}

//GUI
let canvas;
let settings;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.mouseWheel(kosmosZoom);
  
  clusterStartX = width/2;
    clusterStartY = height/2;
  
  frameRate(local_frameRate);
  
  settings = QuickSettings.create(20, 20, "Sonnensystemsimulation");
    settings.setDraggable(true);
  settings.addDropDown("System laden", [" ", "Einzelsternsystem", "Doppelsternsystem", "Tripelsystem", "Quadrupelsystem"], function(value) { system(value); }); 
    settings.addRange("Zeitraffer", 1, 20, animationsFaktor, 1, function(value) { animationsFaktor = value; }); 
    settings.addBoolean("Auf größte Masse zentrieren", false, function(value) { zentrieren = value; }); 
    settings.addButton("Alles löschen", function() { resetCanvas(); });
        settings.overrideStyle("Alles löschen", "width", "100%");   
    settings.addRange("Clusterradius", 10, 50, clusterFaktor, 1, function(value) { clusterFaktor = value; });   
    settings.addRange("Clusterrotation", -0.2, 0.2, clusterRotation, 0.01, function(value) { clusterRotation = value; });
    settings.addHTML("ClusterPos", "Clusterpos.: x = " + clusterStartX.toFixed(0) + ", y = " + clusterStartY.toFixed(0));
        settings.hideTitle("ClusterPos");   
    settings.addBoolean("Clusterposition ändern", false, function(value) { clusterPosAendern = value; });       
    settings.addButton("Cluster setzen", function() { massenCluster(clusterStartX, clusterStartY, clusterFaktor, clusterRotation); });      
        settings.overrideStyle("Cluster setzen", "width", "100%");  
    settings.addHTML("MasseNeuText", "<strong>Objekt neu:</strong> Masse einstellen - SHIFT und linke Maustaste");
        settings.hideTitle("MasseNeuText");
    settings.addRange("Objektmasse", 1, 1000, masse, 1, function(value) { masse = value; });        
    settings.addButton("Massen verteilen", function() { massenRechteck(); });
        settings.overrideStyle("Massen verteilen", "width", "100%");    
    settings.addBoolean("Pause", false, function(value) { pause = value; });    
    settings.addHTML("Zoom", "Zoom mit Mausrad (x" + anpassungAnsicht.ansicht.zoom.toFixed(2) + ")");
        settings.hideTitle("Zoom");
    settings.addHTML("Pan", "<strong>Verschieben:</strong> STRG und linke Maustaste - Maus bewegen");
        settings.hideTitle("Pan");      
    settings.addRange("Gravitationsfaktor", 0, 20, gravitationsFaktor, 1, function(value) { gravitationsFaktor = value; });
    settings.addHTML("Version", "V1.01 - Pt");
        settings.hideTitle("Version"); 
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(250);
  deltaT = animationsFaktor * 0.001 * local_frameRate;
  
    if (!pause) {
        gravitationsRechner(gObjektArray);
    }   
    if (zentrieren) {
        masseZentrieren(gObjektArray);
    }     
  
    push();
        translate(anpassungAnsicht.ansicht.x, anpassungAnsicht.ansicht.y);
        scale(anpassungAnsicht.ansicht.zoom);
    
        gObjekteZeichnen(gObjektArray);
    
        if (einzelneMasseDazu && !anpassungAnsicht.ansichtPos.boolVerschieben) {
            var vPfeilVec = createVector((currentMouseX-mouseInitX)/einzelneMasseDazuFaktor, (currentMouseY-mouseInitY)/einzelneMasseDazuFaktor);
        let richtungsWinkel = vPfeilVec.heading();
            stroke('teal');
            strokeWeight(3/anpassungAnsicht.ansicht.zoom);
            line(mouseInitX, mouseInitY, mouseInitX + vPfeilVec.x, mouseInitY + vPfeilVec.y);
        push()
            let offset = 5;
            translate(mouseInitX + vPfeilVec.x, mouseInitY + vPfeilVec.y);
            rotate(richtungsWinkel+HALF_PI);
            triangle(-offset*0.5, offset, offset*0.5, offset, 0, -offset/2);
        pop();          
        }   
    pop();
}

function keyPressed() {
    switch(keyCode) {
    //SHIFT
  case 16:      
    shiftPressed = true;
    break;
    //STRG
  case 17:      
    strgPressed = true;
    break;    
  default:
    }
}

function keyReleased() {
    switch(keyCode) {
    //SHIFT
  case 16:
    shiftPressed = false;
    break;
    //STRG
  case 17:
    strgPressed = false;
    break;
  default:
    }
}

function mousePressed() {
  if(!shiftPressed && strgPressed) {
    anpassungAnsicht.ansichtPos.boolVerschieben = true;
    anpassungAnsicht.ansichtPos.letztesX = mouseX;
    anpassungAnsicht.ansichtPos.letztesY = mouseY;
  }
  if(shiftPressed) {
    mouseInitX = (mouseX-anpassungAnsicht.ansicht.x)/anpassungAnsicht.ansicht.zoom;
    mouseInitY = (mouseY-anpassungAnsicht.ansicht.y)/anpassungAnsicht.ansicht.zoom;
    einzelneMasseDazu = true;
  }
}

function mouseDragged() {
  if(!shiftPressed && !zentrieren && strgPressed) {      
    const {letztesX, letztesY, boolVerschieben} = anpassungAnsicht.ansichtPos;
    if(!boolVerschieben) return;

    const pos = {x: mouseX, y: mouseY};
    const dx = pos.x - letztesX;
    const dy = pos.y - letztesY;

    if(letztesX || letztesY) {
      anpassungAnsicht.ansicht.x += dx;
      anpassungAnsicht.ansicht.y += dy;
      anpassungAnsicht.ansichtPos.letztesX = pos.x;
      anpassungAnsicht.ansichtPos.letztesY = pos.y;
    }
  }
    currentMouseX = (mouseX-anpassungAnsicht.ansicht.x)/anpassungAnsicht.ansicht.zoom;
    currentMouseY = (mouseY-anpassungAnsicht.ansicht.y)/anpassungAnsicht.ansicht.zoom;        
}

function mouseMoved() {
  currentMouseX = (mouseX-anpassungAnsicht.ansicht.x)/anpassungAnsicht.ansicht.zoom;
    currentMouseY = (mouseY-anpassungAnsicht.ansicht.y)/anpassungAnsicht.ansicht.zoom;
}

function mouseReleased() {
  if(!shiftPressed && !zentrieren && strgPressed) {        
    anpassungAnsicht.ansichtPos.letztesX = null;
    anpassungAnsicht.ansichtPos.letztesY = null;
  }
    if (einzelneMasseDazu) {
        let vx = (currentMouseX - mouseInitX) / einzelneMasseDazuFaktor;
        let vy = (currentMouseY - mouseInitY) / einzelneMasseDazuFaktor;
        gObjektDazu(masse, createVector(vx, vy), createVector(mouseInitX, mouseInitY));
        gObjekteZeichnen(gObjektArray);
    }
    einzelneMasseDazu = false;
    anpassungAnsicht.ansichtPos.boolVerschieben = false;
    
    if(clusterPosAendern) {
        clusterStartX = currentMouseX;
        clusterStartY = currentMouseY;
        settings.setValue("ClusterPos", "Clusterpos.: x = " + clusterStartX.toFixed(0) + ", y = " + clusterStartY.toFixed(0));
        settings.setValue("Clusterposition ändern", false);
    }       
}

function kosmosZoom() {
    const {x, y, deltaY} = event;
    const richtung = deltaY > 0 ? -1 : 1;
    const faktor = 0.05;
    const zoom = 1 * richtung * faktor;        
    const wx = (x-anpassungAnsicht.ansicht.x)/(width*anpassungAnsicht.ansicht.zoom);
    const wy = (y-anpassungAnsicht.ansicht.y)/(height*anpassungAnsicht.ansicht.zoom);
    anpassungAnsicht.ansicht.zoom += zoom;
    if(anpassungAnsicht.ansicht.zoom > 0.25 && anpassungAnsicht.ansicht.zoom < 2.05){
      anpassungAnsicht.ansicht.x -= wx*width*zoom;
      anpassungAnsicht.ansicht.y -= wy*height*zoom;
    } else {
        anpassungAnsicht.ansicht.zoom -= zoom;
      }
    settings.setValue("Zoom", "Zoom mit Mausrad (x" + anpassungAnsicht.ansicht.zoom.toFixed(2) + ")");
}

function gObjekt(m, v, ort) {
    this.masse = m;
    this.geschwindigkeit = v;
    this.resGKraft = createVector(0, 0);    
    this.ort = ort;
    this.farbe = color(0, Math.floor(random(0,100)), Math.floor(random(50,200)));
    this.kollision = absorbiereGObjekt;
    this.radius = Math.cbrt(this.masse);
    this.explosion = true;
}

function gObjektDazu(m, v, ort) {
    let gObj = new gObjekt(m, v, ort);
    gObjektArray.push(gObj);
}

function massenCluster(centerX, centerY, cFaktor, cRotation) {
    for (let i = 0; i < 1000; i++) {
        let angle = random(2 * PI);
        let dist = Math.pow(random(cFaktor), 2);
        let x = centerX + dist * Math.cos(angle);
        let y = centerY + dist * Math.sin(angle);
        let vx = dist * Math.sin(angle) * cRotation;
        let vy = -dist * Math.cos(angle) * cRotation;
        gObjektDazu(random(2,10), createVector(vx, vy), createVector(x, y));
    }
    gObjekteZeichnen(gObjektArray);
}

function massenRechteck() {
    let xMax = width;
    let yMax = height;
    for (let i = 0; i < 1200; i++) {
        let x = (random(xMax)-anpassungAnsicht.ansicht.x)/anpassungAnsicht.ansicht.zoom;
        let y = (random(yMax)-anpassungAnsicht.ansicht.y)/anpassungAnsicht.ansicht.zoom;
        let vx = random(-20,20);
        let vy = random(-20,20);
        gObjektDazu(random(2,10), createVector(vx, vy), createVector(x, y));
    }
    gObjekteZeichnen(gObjektArray);
}

function masseZentrieren(gObjArr) {
    let x = 0;
    let y = 0;
    let maxMasse = 0;
    for (let i = 0; i < gObjArr.length; i ++) {
        if (gObjArr[i].masse > maxMasse) {
            x = gObjArr[i].ort.x;
            y = gObjArr[i].ort.y;
            maxMasse = gObjArr[i].masse;
        }
    }
    anpassungAnsicht.ansicht.x = (windowWidth/2 - x*anpassungAnsicht.ansicht.zoom);
    anpassungAnsicht.ansicht.y = (windowHeight/2 - y*anpassungAnsicht.ansicht.zoom);    
}

function absorbiereGObjekt(gObjArr) {
    if (this.masse < gObjArr.masse) {
        this.farbe = gObjArr.farbe;
        this.explosion = gObjArr.explosion;
    }
    //zentraler vollstaendig inelastischer Stoss mit Impulserhaltung
    this.geschwindigkeit.x = (this.geschwindigkeit.x * this.masse + gObjArr.geschwindigkeit.x * gObjArr.masse) / (this.masse + gObjArr.masse);
    this.geschwindigkeit.y = (this.geschwindigkeit.y * this.masse + gObjArr.geschwindigkeit.y * gObjArr.masse) / (this.masse + gObjArr.masse);
    //neuer Ort des absorbierten Körpers aus Schwerpunktsatz
    this.ort.x = (this.ort.x * this.masse + gObjArr.ort.x * gObjArr.masse) / (this.masse + gObjArr.masse);
    this.ort.y = (this.ort.y * this.masse + gObjArr.ort.y * gObjArr.masse) / (this.masse + gObjArr.masse);
    //neue Masse aus Addition der Massen
    this.masse += gObjArr.masse;
    //neuer Radius im vereinfachten Modell
    this.radius = Math.cbrt(this.masse);
    if (this.radius > sonnenRadius) {
        this.explosion = true;
    }
}

function Explosion(x, y, r, t, d) {
    this.xKoord = x;
    this.yKoord = y;
    this.radius = r;
    this.transparenz = t;
    this.dicke = d;
}

function gObjekteZeichnen(gObjArr) {
    for (let i = 0; i < gObjArr.length; i++) {
        if(gObjArr[i].radius > sonnenRadius) {
            if(gObjArr[i].explosion){
                gObjArr[i].explosion = false;
                let explosionNeu = new Explosion(gObjArr[i].ort.x, gObjArr[i].ort.y, 10, 50, 15);
                explosionsArray.push(explosionNeu);
            }
            strokeWeight(0);
            stroke(gObjArr[i].farbe);           
            fill(243, 159, 24);
        }
        else {
            strokeWeight(0.5);
            stroke(gObjArr[i].farbe);
            fill(gObjArr[i].farbe);
        }
        ellipse(gObjArr[i].ort.x, gObjArr[i].ort.y, gObjArr[i].radius*2, gObjArr[i].radius*2);      
        }
    for (let k = 0; k < explosionsArray.length; k++) {
        strokeWeight(explosionsArray[k].dicke/anpassungAnsicht.ansicht.zoom);
        if(explosionsArray[k].radius < width*2) {
            stroke(243, 159, 24, explosionsArray[k].transparenz);
            fill(243, 159, 24, 0);
            ellipse(explosionsArray[k].xKoord, explosionsArray[k].yKoord, explosionsArray[k].radius, explosionsArray[k].radius);
            explosionsArray[k].radius += 20;
            explosionsArray[k].transparenz * 0.9;
            explosionsArray[k].dicke *= 0.93;
        }
    }
}

//Inverse Euler
function gravitationsRechner(gObjArr) {
    for (let i = 0; i < gObjArr.length; i++) {
        let resultierendeGKraft = createVector(0,0);
        for (let j = 0; j < gObjArr.length; j++) {
            if (j != i) {
                //Entfernung berechnen
                let xDist = gObjArr[i].ort.x - gObjArr[j].ort.x;
                let yDist = gObjArr[i].ort.y - gObjArr[j].ort.y;
                //Satz des Pythagoras
                let entfernung = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
                if (entfernung < gObjArr[i].radius + gObjArr[j].radius) {
                    gObjArr[i].kollision(gObjArr[j]);
                    gObjArr.splice(j, 1);
                } 
                else {
                    let gravitationsKraft = gravitationsFaktor * (gObjArr[i].masse * gObjArr[j].masse) / Math.pow(entfernung, 2);
                    //x-, y-Komponente aus Strahlensatz
                    resultierendeGKraft.x -= Math.abs(gravitationsKraft * (xDist / entfernung)) * Math.sign(xDist);
                    resultierendeGKraft.y -= Math.abs(gravitationsKraft * (yDist / entfernung)) * Math.sign(yDist);
                }           
            }
        }
        //a = Kraft / Masse, dv = a * dt
        gObjArr[i].geschwindigkeit.x += (resultierendeGKraft.x / gObjArr[i].masse) * deltaT;
        gObjArr[i].geschwindigkeit.y += (resultierendeGKraft.y / gObjArr[i].masse) * deltaT;
        gObjArr[i].resGKraft.x = 0;
        gObjArr[i].resGKraft.y = 0;
        gObjArr[i].resGKraft.add(resultierendeGKraft);      
    }
    for (let i = 0; i < gObjArr.length; i++) {
        //ds = v * dt
        gObjArr[i].ort.x += gObjArr[i].geschwindigkeit.x * deltaT;
        gObjArr[i].ort.y += gObjArr[i].geschwindigkeit.y * deltaT;
    }
}