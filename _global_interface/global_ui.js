let allTitreStyles = [];
let indexTitreStyle = 0;
let allTitreStyleDef = [];
let listTitreH1 = [];
let indexInputTitre = 0;
let listInputTitre = [];

let trackZIndex = [];

let titreStyleDef;
function createStyleDef() {
    let newTitreStyle = document.createElement("div");
    newTitreStyle.addEventListener("click", (e) => selectTitreStyle(e));
    titreStyleDef = new TitreStyle("0px", "0px", "75px", "garamond", "#50FF50", "#3000DD", indexTitreStyle, newTitreStyle);

    let titreStyleSelect = document.getElementById("titre-style-select");
    newTitreStyle.classList.add("titre-style-selector");
    newTitreStyle.title = indexTitreStyle;

    let newIndex = "n°" + indexTitreStyle;
    newTitreStyle.innerHTML = newIndex + ', ' + titreStyleDef.x + ', ' + titreStyleDef.y + ', ' + titreStyleDef.fontSize + ', ' + titreStyleDef.fontFamily + ', ' + titreStyleDef.color + ', ' + titreStyleDef.backgroundColor;
    titreStyleSelect.appendChild(newTitreStyle);
    allTitreStyles.push(titreStyleDef);
    allTitreStyleDef.push(titreStyleDef);

    indexTitreStyle++;
}
createStyleDef();

function laodTitreFillers() {
    let titreFillers = document.getElementsByClassName("pagedH1");
    for (let i = 0; i < titreFillers.length; i++) {
        titreFillers[i].id = "titre" + (i + 1);
        listTitreH1.push(new TitreH1(titreFillers[i].id, titreFillers[i].innerHTML, titreStyleDef, titreFillers[i]))
    }
    for (const elem of listTitreH1) {
        elem.updateStyle();

        listInputTitre.push(new InputTitreDomElem(indexInputTitre, elem.txt));
        indexInputTitre++;
    }
    let inputTitreContainer = document.getElementById("item_titre_h1");
    for (const elem of listInputTitre) {
        elem.addToUI(inputTitreContainer);
    }
}
laodTitreFillers();

function changeTitre(titre) {
    let subT = document.getElementById("subT" + titre).value;
    let titreH1 = document.getElementById("titre" + titre);
    titreH1.innerHTML = subT;
}

function addTitreStyle() {
    let titreCssInput = document.querySelectorAll(".titreCssInput");
    let titreStyleSelect = document.getElementById("titre-style-select");

    let newTitreStyle = document.createElement("div");
    newTitreStyle.addEventListener("click", (e) => selectTitreStyle(e));
    let newTstyle = new TitreStyle(titreCssInput[0].value, titreCssInput[1].value, titreCssInput[2].value, titreCssInput[3].value, titreCssInput[4].value, titreCssInput[5].value, indexTitreStyle, newTitreStyle);

    newTitreStyle.classList.add("titre-style-selector");
    newTitreStyle.title = indexTitreStyle;
    let newIndex = "n°" + indexTitreStyle;
    newTitreStyle.innerHTML = newIndex + ', ' + newTstyle.x + ', ' + newTstyle.y + ', ' + newTstyle.fontSize + ', ' + newTstyle.fontFamily + ', ' + newTstyle.color + ', ' + newTstyle.backgroundColor;

    titreStyleSelect.appendChild(newTitreStyle);
    allTitreStyles.push(newTstyle);

    indexTitreStyle++;
}

let radio_H1;
let arrRadio_H1;
let titreActif;

let nameTitreSelected = document.getElementById("name-titre-selected");

function radioSelected(e) {
    let curr = e.target.value;
    titreActif = listTitreH1[curr];
    nameTitreSelected.innerHTML = titreActif.index;

    loadCurrentTitreCss();
}

function selectTitreStyle(e) {
    let sTarget = e.target.title;
    console.log(e.target.title);

    titreActif.cssStyling = allTitreStyles[sTarget];
    titreActif.updateStyle();

    loadCurrentTitreCss();
}

function loadCurrentTitreCss() {
    let titreCssInput = document.querySelectorAll(".titreCssInput");

    for (let i = 0; i < titreCssInput.length; i++) {
        titreCssInput[i].value = Object.values(titreActif.cssStyling)[i]
    }

    let titreStyleSelector = document.querySelectorAll(".titre-style-selector");
    let titreActifCssIndex = titreActif.cssStyling.styleIndex;

    for (const elem of titreStyleSelector) {
        if (elem.classList.contains("active-titre-style")) {
            elem.classList.remove("active-titre-style")
        }
        if (titreActifCssIndex == elem.title) {
            elem.classList.add("active-titre-style")
        }
    }
}

function loadNewStyleDef() {
    let newTitreStyle = document.createElement("div");
    newTitreStyle.addEventListener("click", (e) => selectTitreStyle(e));

    let randomX = Math.floor(getRandomArbitrary(-100, 100) + 100) + "px";
    let randomY = Math.floor(getRandomArbitrary(-200, 200) + 200) + "px";

    let randomTextColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    let randomBckColor = "#" + Math.floor(Math.random() * 16777215).toString(16);


    let newTstyle = new TitreStyle(randomX, randomY, "60px", "arial", randomTextColor, randomBckColor, indexTitreStyle, newTitreStyle);

    let titreStyleSelect = document.getElementById("titre-style-select");
    newTitreStyle.classList.add("titre-style-selector");
    newTitreStyle.title = indexTitreStyle;

    let newIndex = "n°" + indexTitreStyle;
    newTitreStyle.innerHTML = newIndex + ', ' + newTstyle.x + ', ' + newTstyle.y + ', ' + newTstyle.fontSize + ', ' + newTstyle.fontFamily + ', ' + newTstyle.color + ', ' + newTstyle.backgroundColor;
    titreStyleSelect.appendChild(newTitreStyle);
    allTitreStyles.push(newTstyle);
    allTitreStyleDef.push(newTstyle);

    indexTitreStyle++;
}
for (let i = 0; i < 6; i++) {
    loadNewStyleDef();
}

function addTitreH1() {
    let pagedDummy = document.getElementById("paged-dummy");
    let inputTitreContainer = document.getElementById("item_titre_h1");

    let newPagedTitreDomElem = new PagedTitreDomElem(pagedDummy);

    let newTitreTxt = newPagedTitreDomElem.h1.innerHTML;

    let newTitreH1 = new TitreH1(newPagedTitreDomElem.h1.id, newTitreTxt, allTitreStyleDef[Math.floor(Math.random() * 6)], newPagedTitreDomElem.h1)
    listTitreH1.push(newTitreH1);

    newTitreH1.updateStyle();

    listInputTitre.push(new InputTitreDomElem(indexInputTitre, newTitreTxt));
    listInputTitre[listInputTitre.length - 1].addToUI(inputTitreContainer);

    indexInputTitre++;
}


// Drag text handle

let titreFocus;
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("pagedH1")) {
        titreFocus = e.target;
        txtHandle.moveTo(e.target)

    }
})
// console.log(txtHandle)
let dragTxt = false;
txtHandle.handleObj.addEventListener("mousedown", (e) => {
    console.log(e)
    dragTxt = true;
})

txtHandle.handleObj.addEventListener("mouseup", (e) => {
    console.log(e)
    dragTxt = false;
})

document.addEventListener("mousemove", (e) => {
    if(dragTxt){
        global_interface.style.pointerEvents = "none";
        // console.log(global_interface.style.pointerEvents)
        let mouseX = e.clientX
        let mouseY = e.clientY
        txtHandle.dragObj(mouseX, mouseY);
    } else {
        global_interface.style.pointerEvents = "auto";
        // console.log(global_interface.style.pointerEvents)
    }
})




function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}











// DRAG FUNCTIONS 
// DRAG FUNCTIONS 
// DRAG FUNCTIONS 
// DRAG FUNCTIONS 
// DRAG FUNCTIONS 













let globalGrabStat = true;
let globalDragTarget;
let allDragElem = document.querySelectorAll(".drag")
let allHandleElem = document.querySelectorAll(".handle")

for (const elem of allHandleElem) {
    elem.onmousedown = (event) => {
        globalGrabStat = false;
        globalDragTarget = event.target;
    }
}

document.onmousemove = (event) => {
    if (!globalGrabStat) {
        let rectHandle = globalDragTarget.getBoundingClientRect();
        let offX = rectHandle.width / 2 + 16;
        let offY = rectHandle.height / 2 + 16;
        globalDragTarget.parentNode.style.left = event.clientX - offX + "px";
        globalDragTarget.parentNode.style.top = event.clientY - offY + "px";
    }
}

for (const elem of allDragElem) {
    elem.onmouseup = () => {
        globalGrabStat = true;
    }
}










// SWITCHING WORKING LAYER 
// SWITCHING WORKING LAYER 
// SWITCHING WORKING LAYER 
// SWITCHING WORKING LAYER 
// SWITCHING WORKING LAYER 
// SWITCHING WORKING LAYER 












// SWITCHING WORKING LAYER

let layerButton = document.querySelectorAll(".layer-button");
let modifierLayers = document.querySelectorAll(".modifier-layer");

for (const elem of layerButton) {
    elem.addEventListener("click", (event) => toggleModifierLayer(event))
}

// [0] txt   &   [1] canvas

function toggleModifierLayer(e) {
    let pagedDummy = document.getElementById("paged-dummy");
    if (!e.target.classList.contains("active-layer-signal")) {
        if (e.target.id == "canvas-signal-button") {
            layerButton[0].classList.remove("active-layer-signal")
            layerButton[1].classList.add("active-layer-signal")

            modifierLayers[0].classList.remove("active-modifier-layer")

            modifierLayers[1].classList.add("active-modifier-layer")

            pagedDummy.style.opacity = "0.15";
        } else {
            layerButton[1].classList.remove("active-layer-signal")
            layerButton[0].classList.add("active-layer-signal")

            modifierLayers[1].classList.remove("active-modifier-layer")

            modifierLayers[0].classList.add("active-modifier-layer")

            pagedDummy.style.opacity = "1";
        }
    }
}


let sketch2print_overlay = document.querySelector("#sketch2print-overlay")
let visible_overlay_button = document.querySelector("#visible-overlay-button")
let global_interface = document.querySelector("#global-interface")
console.log(visible_overlay_button)

sketch2print_overlay.addEventListener("mouseenter", (e) => {
    // console.log(e.target)
    if (visible_overlay_button.innerHTML == "Hover") {
        console.log(global_interface)
        global_interface.classList.remove("global-interface-hidden")
        global_interface.classList.add("global-interface-visible")
    }
})

sketch2print_overlay.addEventListener("mouseleave", (e) => {
    if (visible_overlay_button.innerHTML == "Hover") {
        global_interface.classList.remove("global-interface-visible")
        global_interface.classList.add("global-interface-hidden")
    }
})

visible_overlay_button.addEventListener("click", (e) => {
    console.log(e.target.innerHTML)
    toggleDisplayOverlay(e.target.innerHTML)
})

function toggleDisplayOverlay(elemContent) {
    if (elemContent == "Still") {
        visible_overlay_button.innerHTML = "Hover";
        console.log(elemContent);
        global_interface.classList.remove("global-interface-visible")
        global_interface.classList.add("global-interface-hidden")
    } else if (elemContent == "Hover") {
        visible_overlay_button.innerHTML = "Still";
        global_interface.classList.remove("global-interface-hidden")
        global_interface.classList.add("global-interface-visible")
    }
}





// FUNCTIONS FOR SKETCHES
// FUNCTIONS FOR SKETCHES
// FUNCTIONS FOR SKETCHES
// FUNCTIONS FOR SKETCHES
// FUNCTIONS FOR SKETCHES
// FUNCTIONS FOR SKETCHES
// FUNCTIONS FOR SKETCHES
// FUNCTIONS FOR SKETCHES
// FUNCTIONS FOR SKETCHES


// FUNCTIONS FOR SKETCHES

let listSketches = []; let indexSketches = 0;


function loadInputSketches() {
    for (let i = 0; i < 4; i++) {
        let inputItemsSketches = document.getElementById("input-items-sketches");
        let newInputSketch = new InputSketchElem(indexSketches)
        newInputSketch.addToUI(inputItemsSketches)
        listSketches.push(newInputSketch)
        indexSketches++;
    }
}
loadInputSketches();


const PaperSizes = {
    A5: {
        width: 1754,
        height: 2480
    },
    A4: {
        width: 2480,
        height: 3508
    },
    A3: {
        width: 3508,
        height: 4960
    },
    A2: {
        width: 4960,
        height: 7016
    },
    A1: {
        width: 7016,
        height: 9920
    }
}

// console.log(PaperSizes);
let canvasDummy = document.getElementById("canvas-dummy");

class canvasContainer {
    constructor() {
        this.container = document.createElement("div");
        this.container.id = "canvasContainer_1";
        this.container.style.display = "block";
        this.container.style.position = "absolute";

        canvasDummy.appendChild(this.container);
    }
}

let myCanvasContainer;
setTimeout(() => {
    myCanvasContainer = new canvasContainer();
    addSketch();
}, 500);

const sketch_1 = p => {

    let hCanvas = 730;
    let wCanvas = 460;

    class floorBoxe {
        constructor(x, y, scale, speed, height) {
            this.x = p.random() * wCanvas + x;
            this.y = y;
            this.scale = scale;
            this.speed = p.random() * 5 + speed;
            this.height = height;
            this.r = Math.floor(p.random() * 255);
            this.g = Math.floor(p.random() * 255);
            this.b = Math.floor(p.random() * 255);
            this.acc = 1.02;
        }
        show() {
            p.push();
            p.translate(this.x, this.y);
            p.scale(this.scale);
            p.stroke(249, 183, 30);
            p.strokeWeight(5);
            //fill(255, 255, 255);
            p.fill(255, 0, 0);
            //emissiveMaterial(255, 255, 255);
            //specularMaterial(this.r, 255);
            p.square(0, 0, this.height);
            p.pop();
            if (this.y >= hCanvas) {
                this.y = 0;
                // this.acc = 1.006;
                this.speed = p.random() * 10;
            }
            this.y += this.speed;
            this.speed = this.speed * this.acc;
            // this.acc += 0.01;
        }
    }

    let boxes = [];
    for (let i = 0; i < 10; i++) {
        boxes.push(new floorBoxe(0, 0, 1, 10, 10));
    }

    function showBoxes() {
        for (let i = 0; i < boxes.length; i++) {
            boxes[i].show();
        }
    }
    let doShowBoxes = false;
    setTimeout(() => { doShowBoxes = true }, 500);

    let x1 = 100;
    let y1 = 50;

    p.setup = function () {
        p.createCanvas(wCanvas, hCanvas);
    };

    p.draw = function () {
        p.background(0);
        // p.fill(255);
        // p.rect(y + Math.cos(x1) * 250, y1 + Math.sin(x1) * 250, 50, 50);
        // x1 += 0.05;

        if (doShowBoxes) {
            showBoxes();
        }
    };
};

let sketches = [];

function addSketch() {
    let canvasDef0 = document.getElementById("defaultCanvas0");
    canvasDef0.parentNode.remove();
    sketches.push(new p5(sketch_1, myCanvasContainer.container));
    // pageCanvas();
}
