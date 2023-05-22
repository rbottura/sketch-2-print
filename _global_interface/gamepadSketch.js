console.log("gamepad loading")

let jImg, indexImg = 0, indexFont = 3;
let joystick;

let Ps_pink = [], Garam_blue = [], Raleway_green = [], timbres = [], Garam_pink = [], Garam_bw_small = [], fleurs = [], Destra_yellow = [], Minipax_white = [], brushes = [];
let listColorFonts = [Ps_pink, Garam_blue, Garam_pink, Garam_bw_small, Raleway_green, timbres, fleurs, Destra_yellow, Minipax_white, brushes];

let overlayCanvas;

loadGamepadDraw()
function loadGamepadDraw() {

    listSkt[1] = p => {

        p.preload = function () {

            for (let i = 0; i < 58; i++) {
                Ps_pink.push(p.loadImage('./gamepad_sprites/PeaceSans/Ps_pink/' + i + '.png'))
            }
            for (let i = 0; i < 58; i++) {
                Garam_blue.push(p.loadImage('./gamepad_sprites/GaramondI/Garam_blue/' + i + '.png'))
            }
            for (let i = 0; i < 58; i++) {
                Garam_pink.push(p.loadImage('./gamepad_sprites/GaramondI/Garam_pink/' + i + '.png'))
            }
            for (let i = 0; i < 58; i++) {
                Garam_bw_small.push(p.loadImage('./gamepad_sprites/GaramondI/Garam_bw_small/' + i + '.png'))
            }
            for (let i = 0; i < 78; i++) {
                Raleway_green.push(p.loadImage('./gamepad_sprites/Raleway/Raleway_green/' + i + '.png'))
            }
            for (let i = 1; i < 9; i++) {
                timbres.push(p.loadImage('./gamepad_sprites/timbre/timbre' + i + '.jpeg'))
            }
            for (let i = 0; i < 11; i++) {
                fleurs.push(p.loadImage('./gamepad_sprites/fleurs/' + i + '.png'))
            }
            for (let i = 0; i < 78; i++) {
                Destra_yellow.push(p.loadImage('./gamepad_sprites/Destra/Destra_yellow/' + i + '.png'))
            }
            for (let i = 0; i < 78; i++) {
                Minipax_white.push(p.loadImage('./gamepad_sprites/Minipax/minipax_white/' + i + '.png'))
            }
            for (let i = 1; i < 60; i++) {
                brushes.push(p.loadImage('./gamepad_sprites/brushes/sprite(' + i + ').png'))
            }
        }

        let wCanvas = pageProp.width;
        let hCanvas = pageProp.height;

        class JoyImage {
            constructor(x, y, scale, img) {
                this.x = x;
                this.y = y;
                this.size = scale;
                this.img = img;

                this.rotation = 0;
            }
            print() {
                overlayCanvas.push()
                overlayCanvas.translate(this.x, this.y)
                overlayCanvas.rotate(this.rotation)
                overlayCanvas.imageMode(p.CENTER)
                overlayCanvas.scale(this.size)
                overlayCanvas.image(this.img, 0, 0)
                overlayCanvas.pop()
            }
            show() {
                p.push()
                p.translate(this.x, this.y)
                p.scale(this.size)
                p.imageMode(p.CENTER)
                p.rotate(this.rotation)
                p.image(this.img, 0, 0)
                p.pop()
            }
        }

        let cnv;
        // let cam, deep;
        p.setup = function () {
            cnv = p.createCanvas(wCanvas, hCanvas);
            p.pixelDensity(3)

            jImg = new JoyImage(WiW / 2, WiH / 2, 1, listColorFonts[indexFont][indexImg])

            console.log(jImg)

            overlayCanvas = p.createGraphics(WiW, WiH)
            overlayCanvas.background(255)
            // overlayCanvas.blendMode(OVERLAY)

            joystick = p.createJoystick(false);

            joystick.onButtonPressed(onJoystick);
            // joystick.onButtonReleased(onJoystick);
            joystick.onAxesPressed(onJoystick);
            joystick.onAxesReleased(onJoystick);
            // p.createCanvas(wCanvas, hCanvas);
        };

        p.draw = function () {

            // console.log(jImg)

            p.imageMode(p.CENTER)
            p.rectMode(p.CENTER)
            if (p.mouseIsPressed) {
                overlayCanvas.fill(255);
                overlayCanvas.noStroke()
                overlayCanvas.circle(p.mouseX, p.mouseY, 90)
            }

            p.push()
            p.translate(WiW / 2, WiH / 2)
            p.image(overlayCanvas, 0, 0)
            p.pop();

            p.noFill()
            p.stroke(125)
            p.circle(p.mouseX, p.mouseY, 90)

            if (Object.keys(controllers).length != 0) {
                jImg.show();
                updateBrush();
            }

            if (!showCanvas) stopCanvas()
            else playCanvas();
        };

        addEventListener("keydown", (e) => {
            if (e.key == "&") {
                console.log(overlayCanvas.canvas)
                showPrintImage(overlayCanvas.canvas);
            }
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



function onJoystick(e) {
    console.log("onJoystick", e.index + " _ " + e.name);
    switch (e.name) {
        case 'buttonGreen':
            jImg.print();
            break;
    }
    switch (e.index) {
        case 4:
            if (indexImg == listColorFonts[indexFont].length - 1) {
                indexImg = 0;
            } else {
                indexImg++;
            }
            break;
        case 5:
            console.log(indexImg)
            if (indexImg == 0) {
                indexImg = listColorFonts[indexFont].length - 1;
            } else {
                indexImg--;
            }
            break;
        case 6:
            jImg.rotation -= e.value * 0.01;
            break;
        case 7:
            jImg.rotation += e.value * 0.01;
            break;
        case 9:
            overlayCanvas.fill(255)
            overlayCanvas.noStroke()
            overlayCanvas.rect(0, 0, WiW, WiH)
            break;
        case 10:
            jImg.x = wCanvas / 2;
            jImg.y = hCanvas / 2;
            break;
        case 12:
            indexImg = 0;
            if (indexFont == listColorFonts.length - 1) {
                indexFont = 0;
            } else {
                indexFont++;
            }
            break;
        case 13:
            indexImg = 0;
            if (indexFont == 0) {
                indexFont = listColorFonts.length - 1;
            } else {
                indexFont--;
            }
            break;
    }
    jImg.img = listColorFonts[indexFont][indexImg]
}

let rotateVal = 0, scaleVal = 1, speed = 10;
function updateBrush() {
    // console.log(jImg)

    let x1 = financial(controllers[0].gamepad.axes[0])
    let y1 = financial(controllers[0].gamepad.axes[1])

    console.log("x1 : " + x1)
    if (x1 <= -0.12 || x1 >= 0) {
        jImg.x += x1 * speed;
    }
    // if(x1 >= 0.)
    jImg.y += y1 * speed;

    rotateVal -= controllers[0].gamepad.buttons[6].value * 0.06;
    rotateVal += controllers[0].gamepad.buttons[7].value * 0.06;
    jImg.rotation = rotateVal;

    scaleVal -= controllers[0].gamepad.buttons[1].value * 0.008;
    scaleVal += controllers[0].gamepad.buttons[2].value * 0.008;

    jImg.size = scaleVal;

    if (controllers[0].gamepad.buttons[0].value != 0) {
        jImg.print();
    }
};

let sketchesTag = [], globalZindex = 1;
function imageTagControl(add, show, imgTag) {
    globalZindex++;
    if (add) {
        let newImgTag = document.createElement('div');
        newImgTag.setAttribute("name", sketchesTag.length)
        sketchesTag.push(newImgTag)
        newImgTag.innerHTML = 'img ' + sketchesTag.length;
        newImgTag.classList.add('item_interface', 'calque_tag', 'image_tag');
        document.querySelector("#sketches-mini-wrapper").appendChild(newImgTag);
        newImgTag.addEventListener("click", (e) => { imageTagControl(false, true, e.target) })
    } else if (show) {
        colorSelectedTag(imgTag)
        let targetImgIndex = imgTag.getAttribute('name');
        savedImg[targetImgIndex].style.zIndex = globalZindex;
    }
}

function colorSelectedTag(tag) {
    for (const elem of sketchesTag) {
        if (elem.classList.contains("active_calque_tag"))
            elem.classList.remove("active_calque_tag")
    }
    tag.classList.add("active_calque_tag");
}

function financial(x) {
    return Number.parseFloat(x).toFixed(1);
}

