console.log("classes loading")

const WiW = window.innerWidth, WiH = window.innerHeight;
const offsetHandleSize = 12;

let offsetPagePositionX = 514;
let offsetPagePositionY = 19;
let scalingFactor = 1/pageRatio;

// liste des calques par defaut
let listDefCalquesObj = [];

// Liste de tous les calques à l'écran
let listCalques = [];

// Liste de tous les objets Calques 
let listCalquesObj = [];

// Liste de tous les tag de tous les calques
let listCalquesTags = [];

//liste des styles par défaut
let listDefStyles = [];

//liste de tous les styles
let listStyles = [];


const listFonts = ["tahoma", "arial"]

const pageDummy = document.querySelectorAll(".pagedjs_area")[0];
console.log(pageDummy)

let globalCalqueIndex = 0;
class Calque {
    constructor(pageElemStyle) {
        globalCalqueIndex++;
        this.calqueIndex = globalCalqueIndex;
        this.pageElem;
        this.createPageElem();

        this.uiElem;
        this.createUiElem();

        this.pageElemStyle = pageElemStyle;
        this.updateStyle();

        this.pElem;
    }
    createPageElem() {
        this.pageElem = document.createElement("div");
        this.pageElem.classList.add("calqueElem");
        // this.pageElem.style.zIndex =
        this.pageElem.name = this.calqueIndex;
        this.pageElem.innerHTML = "calque" + this.calqueIndex;
        this.pageElem.contentEditable = true;

        listCalques.push(this.pageElem)
        this.addToPage();
    }
    createUiElem() {
        this.uiElem = document.createElement("div");
        this.uiElem.name = this.calqueIndex;
        // this.uiElem.addEventListener("click", () => selectCalque())
        this.uiElem.classList.add("item_interface", "calque_tag")
        this.uiElem.contentEditable = true;
        this.uiElem.innerHTML = "Calque " + this.calqueIndex;
        listCalquesTags.push(this.uiElem);
        let calqueTagsArea = document.querySelector("#calqueTagsArea")
        calqueTagsArea.appendChild(this.uiElem)
    }
    addToPage() {
        pageDummy.appendChild(this.pageElem)
    }
    updateStyle() {
        this.pageElem.style.position = this.pageElemStyle.position;
        this.pageElem.style.left = this.pageElemStyle.onlyCss.x;
        this.pageElem.style.top = this.pageElemStyle.onlyCss.y;
        this.pageElem.style.zIndex = this.pageElemStyle.onlyCss.zIndex;
        this.pageElem.style.fontSize = this.pageElemStyle.onlyCss.fontSize;
        this.pageElem.style.fontFamily = this.pageElemStyle.onlyCss.fontFamily;
        this.pageElem.style.color = this.pageElemStyle.onlyCss.color;
        this.pageElem.style.backgroundColor = this.pageElemStyle.onlyCss.backgroundColor;
    }
}

let globalStyleIndex = 0;
class CalqueStyle {
    constructor(x, y, zIndex, fontSize, fontFamily, color, backgroundColor) {
        globalStyleIndex++;
        this.styleIndex = globalStyleIndex;

        this.onlyCss = {
            x: x,
            y: y,
            zIndex: zIndex,
            fontSize: fontSize,
            fontFamily: fontFamily,
            color: color,
            backgroundColor: backgroundColor,
        }

        this.uiStyleDomElem;

        this.position = "absolute";

        this.createDomElem();
    }
    createDomElem() {
        this.uiStyleDomElem = document.createElement("div");
        this.uiStyleDomElem.name = this.styleIndex - 1;
        this.uiStyleDomElem.addEventListener("click", (e) => selectStyle(e))
        this.uiStyleDomElem.classList.add("style_tag");
        this.uiStyleDomElem.innerHTML = "n° " + this.styleIndex + ", " + this.onlyCss.color + ", " + this.onlyCss.backgroundColor + ", " + this.onlyCss.fontSize;
        let calqueStyleSelection = document.querySelector("#calque-style-selection");
        calqueStyleSelection.appendChild(this.uiStyleDomElem)
    }
}

class textHandle {
    constructor(){
        this.handleObj = document.createElement("div")
        this.handleObj.id = "textHandle";
        this.handleObj.innerHTML = "M";
        this.handleObj.style.position = "absolute";
        this.handleObj.style.left = "0px";
        this.handleObj.style.top = "0px";
        this.handleObj.classList.add("text-handle");
        document.body.appendChild(this.handleObj)

        this.object_handled;
        this.objLeft;
        this.objTop;
    }
    moveTo(elem){
        this.object_handled = elem;

        // console.log(parseInt( window.getComputedStyle(this.object_handled).left))
        //600 correspond au décallage du dummy text
        this.objLeft = (((parseInt(window.getComputedStyle(this.object_handled).left) * pageRatio) + offsetPagePositionX) - offsetHandleSize)  + "px";
        this.objTop = (((parseInt(window.getComputedStyle(this.object_handled).top) * pageRatio) + offsetPagePositionY) - offsetHandleSize) + "px"
        // console.log(this.object_handled.style.left);
        // console.log(this.handleObj.style.left);
        this.handleObj.style.left = this.objLeft; 
        this.handleObj.style.top = this.objTop; 
    }
    dragObj(mx, my){
        this.handleObj.style.left = mx - offsetHandleSize + "px"
        this.handleObj.style.top = my - offsetHandleSize + "px"

        this.object_handled.style.left = (mx - offsetPagePositionX) * scalingFactor + "px"; 
        this.object_handled.style.top = (my - offsetPagePositionY) * scalingFactor + "px";

        updateDisplayPosition(this.object_handled.style.left, this.object_handled.style.top)
    }

}

let txtHandle = new textHandle();





let listSketches = []; let indexSketches = 0;


function loadInputSketches() {
    let sketchesTagsArea = document.getElementById("sketchesTagsArea");
    console.log(sketchesTagsArea)
    //for (let i = 0; i < 4; i++) {
    //    let newInputSketch = new InputSketchElem(indexSketches)
    //    newInputSketch.addToUI(inputItemsSketches)
    //    listSketches.push(newInputSketch)
    //    indexSketches++;
    //}
}
loadInputSketches();

let onScreenCanvasContainer = document.createElement("div");
onScreenCanvasContainer.style.display = "block";
onScreenCanvasContainer.style.position = "absolute";
onScreenCanvasContainer.classList.add("onscreen_canvas")
document.body.appendChild(onScreenCanvasContainer)

let offScreenCanvasContainer = document.createElement("div")
offScreenCanvasContainer.style.display = "block";
offScreenCanvasContainer.style.position = "absolute";
offScreenCanvasContainer.classList.add("offscreen_canvas");
document.body.appendChild(offScreenCanvasContainer)

let myCanvasContainer;

setTimeout(() => { load2canvas() }, 180);

let listCnv = [];
let save = 0;

let sketchIndex = 1;
let grphc, showCanvas = true;

const sketch_1 = p => {

    let wCanvas = 463;
    let hCanvas = 655;

    let skIndex = sketchIndex;
    p.randomSeed(1)
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
            // p.randomSeed(100)
            p.push();
            p.translate(this.x, this.y);
            p.scale(this.scale);
            p.stroke(p.color("orange"));
            p.strokeWeight(2);
            p.fill(255, 0, 0);
            p.square(0, 0, this.height);
            p.pop();
            if (this.y >= hCanvas) {
                this.y = -20;
                // this.acc = 1.006;
                this.speed = p.random() * 50;
            }
            this.y += this.speed;
            this.speed = this.speed * this.acc;
            // this.acc += 0.01;
        }
    }

    let boxes = [];
    for (let i = 0; i < 20; i++) {
        boxes.push(new floorBoxe(0, 0, 1, 10, 50));
    }

    function showBoxes() {
        for (let i = 0; i < boxes.length; i++) {
            boxes[i].show();
        }
    }

    let doShowBoxes = false;
    setTimeout(() => { doShowBoxes = true }, 500);

    let cnv;

    p.setup = function () {
        cnv = p.createCanvas(wCanvas, hCanvas);
        p.pixelDensity(offPixelDensity)
    };

    p.draw = function () {
        p.background(0);

        if (doShowBoxes) {
            showBoxes();
        }

        if (!showCanvas) stopCanvas()
        else playCanvas();

    };

    addEventListener("keydown", (e) => {
        // console.log(e.key);
        if (e.key == "&" && skIndex == 2) {
            showPrintImage(cnv.canvas);
        }
        if(e.key == "é") playCanvas()
    })

    function stopCanvas() {
        p.noLoop()
    }
    
    function playCanvas() {
        p.loop();
    }

};

let sketches = [];

let offPixelDensity = 1;


// !!!! MAUVAISE MANIERE DE CHARGE DEUX SKETCH AVEC DES PARAMETRES difF
function load2canvas() {
    // document.getElementById("defaultCanvas0").remove()
    for (let i = 0; i < 2; i++) {
        if (i == 1) {
            offPixelDensity = 1;
            sketchIndex = 2;
            let newSketch = new p5(listSkt2[1], offScreenCanvasContainer)
            // let newSketch = new p5(sketch_1, offScreenCanvasContainer)
            sketches.push(newSketch)
        } else {
            let newSketch = new p5(listSkt2[0], onScreenCanvasContainer)
            // let newSketch = new p5(sketch_1, onScreenCanvasContainer)
            sketches.push(newSketch)
        }
    }
}


let savedImg = [];
function showPrintImage(canvas) {
    console.log(canvas)
    let imageData = canvas.toDataURL();

    let cnvImage = document.createElement("img");
    savedImg.push(cnvImage);
    cnvImage.classList.add("cnvImage")
    cnvImage.classList.add("imgFilter")
    cnvImage.style.zIndex = savedImg.length;
    cnvImage.src = imageData;

    let pageSheet = document.querySelectorAll(".pagedjs_sheet")[0]
    // console.log(pageSheet)

    pageSheetFstChild = pageSheet.children[0]
    console.log(pageSheetFstChild)

    pageSheet.insertBefore(cnvImage, pageSheetFstChild)
}