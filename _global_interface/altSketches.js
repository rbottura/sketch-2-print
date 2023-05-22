console.log("altSkt loading")

let listSkt = [];

let wCanvas = Math.round(pageProp.width);
let hCanvas = Math.round(pageProp.height);

listSkt[0] = p => {

    let penParts = [];

    class PenPart {
        constructor(x, y, z, scale, speed, obj) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.scale = scale;
            this.speed = speed;
            this.obj = obj
        }
        show() {
            p.push()
            p.translate(this.x, this.y, this.z)
            // p.rotateX(.6)
            p.scale(this.scale)
            p.stroke(p.color("black"))
            p.noFill();
            // p.fill(p.color("rgba(128,255,128,.1)"))
            // p.ambientMaterial(p.color("white"))
            // p.specularMaterial(255)
            p.translate(-10, 20, 0)
            p.rotateY(.6)
            p.rotateX(.8)
            p.strokeWeight(1)
            p.model(this.obj)
            // p.box(50, 72, 120)
            p.pop()
            // p.randomSeed(100)
        }
    }

    let listModels = []
    let listPenParts = []

    p.preload = function () {

        for (let i = 1; i < 18; i++) {
            let part = p.loadModel('./_global_interface/assets/newPen_(' + i + ').obj', true)
            let newPenPart = new PenPart(0, 0, -100, 1, 1, part)
            listPenParts.push(newPenPart);
        }
        let newObj = p.loadModel('./_global_interface/assets/newPen_(' + ptNbr + ').obj', true)

        // penParts.push(newPenPart);
    }


    let skIndex = sketchIndex;
    // p.randomSeed(1)

    let cnv;
    // let cam, deep;
    p.setup = function () {
        cnv = p.createCanvas(wCanvas, hCanvas, p.WEBGL);
        // p.createCanvas(wCanvas, hCanvas);
        p.pixelDensity(3)

        cam = p.camera(0, 0, (p.height / 2) / p.tan(p.PI / 6) * 3, 0, 0, 0, 0, 1, 0);
        let newFov = 3.0;
        deep = p.perspective(p.PI / newFov, p.width / p.height, 0.1, 20000);
        // console.log(deep);
    };

    p.draw = function () {
        p.background(p.color("transparent"));

        p.lights()

        // penParts[0].z = p.mouseX * 5;
        // p.translate(0,0,p.mouseX*5)

        // for (const elem of listPenParts) {
        // elem.show()
        // }
        listPenParts[ptNbr - 1].z = p.mouseX * 5;
        listPenParts[ptNbr - 1].show();

        // penParts[0].show()

        if (!showCanvas) stopCanvas()
        else playCanvas();
    };

    addEventListener("keydown", (e) => {
        if (e.key == "&") showPrintImage(cnv.canvas);
        if (e.key == "é") playCanvas();
    })

    function stopCanvas() {
        p.noLoop()
    }

    function playCanvas() {
        p.loop();
    }

};


let listSketches = []

let onScreenCanvasContainer = document.createElement("div");
onScreenCanvasContainer.style.display = "block";
onScreenCanvasContainer.style.maxHeight = pageProp.height +"px";
onScreenCanvasContainer.style.position = "absolute";
onScreenCanvasContainer.classList.add("onscreen_canvas")
document.body.appendChild(onScreenCanvasContainer)

loadP5canvas();
function loadP5canvas() {
    let newP5 = new p5(listSkt[0], onScreenCanvasContainer)
    listSketches.push(newP5)
}

// TEST FOR MATTER JS
// TEST FOR MATTER JS
// TEST FOR MATTER JS
// TEST FOR MATTER JS

let sketchMatter = []

loadSketchMatter();
function loadSketchMatter() {
    sketchMatter[0] = p => {
        let Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Bodier = Matter.Bodies
        Composite = Matter.Composite;

        let engine;
        let render;

        p.preload = function () {
            // console.log("heloo")
            engine = Engine.create()
            render = Render.create({
                element: onScreenCanvasContainer,
                engine: engine,
                options: {
                    width: 463,
                    height: 655,
                    pixelRatio: 8,
                    wireframes: false,
                }
            })
        }

        let cnv;
        p.setup = function () {
            //prevent default p5 canvas.
            cnv = p.createCanvas(463, 655)
            cnv.elt.remove()
        }

        p.draw = function () {
            p.background(p.color("green"))
        }

        p.mousePressed = function () {

        }

    }
}

// setTimeout(() => { loadP5() }, 350)
function loadP5() {
    let newSketch = new p5(sketchMatter[0], onScreenCanvasContainer)
    // console.log(newSketch)
    sketches.push(newSketch)
}