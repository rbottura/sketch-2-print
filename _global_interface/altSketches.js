console.log("altSkt loading")

let listSkt2 = [];

loadSkt2()
function loadSkt2() {
    let pxlDensity = [1, 15];
    for (let i = 0; i < 2; i++) {
        listSkt2[i] = p => {

            p.preload = function () {
                console.log('preloaddddd')
                let newObj = p.loadModel('./_global_interface/assets/obj1.obj', true)
                let newPenPart = new PenPart(0, 0, -100, 1, 1, newObj)
                console.log(newPenPart)
                penParts.push(newPenPart);
            }

            let wCanvas = 463;
            let hCanvas = 655;

            let skIndex = sketchIndex;
            // p.randomSeed(1)
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
                    p.stroke(255, 180, 23)
                    p.noFill();
                    // p.ambientMaterial(p.color("white"))
                    // p.specularMaterial(255)
                    p.strokeWeight(1 * (pxlDensity[i] / 2))
                    // p.model(this.obj)
                    p.box(50, 72, 120)
                    p.pop()
                    // p.randomSeed(100)
                }
            }

            let penParts = [];

            let cnv;
            // let cam, deep;
            p.setup = function () {
                cnv = p.createCanvas(wCanvas, hCanvas, p.WEBGL);
                // p.createCanvas(wCanvas, hCanvas);
                p.pixelDensity(pxlDensity[i])

                cam = p.camera(0, 0, (p.height / 2) / p.tan(p.PI / 6) * 3, 0, 0, 0, 0, 1, 0);
                let newFov = 3.0;
                deep = p.perspective(p.PI / newFov, p.width / p.height, 0.1, 20000);
                console.log(deep);
            };

            p.draw = function () {
                p.background(p.color("transparen"));

                p.lights()

                penParts[0].z = p.mouseX * 5;

                penParts[0].show()

                if (!showCanvas) stopCanvas()
                else playCanvas();
            };

            addEventListener("keydown", (e) => {
                if (e.key == "&" && skIndex == 2) showPrintImage(cnv.canvas);
                if (e.key == "é") playCanvas();
            })

            function stopCanvas() {
                p.noLoop()
            }

            function playCanvas() {
                p.loop();
            }

        };
    }
}









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
            console.log("heloo")
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

    }
}

setTimeout(() => { loadP5() }, 350)
function loadP5() {
    let newSketch = new p5(sketchMatter[0], onScreenCanvasContainer)
    console.log(newSketch)
    sketches.push(newSketch)

}