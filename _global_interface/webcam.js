
console.log("loading webcam sketch file")

let webcam_canvas;
// loadWebcamSketch();
function loadWebcamSketch() {
    listSkt[2] = pcam => {
        let capture;
        let cnv;

        pcam.setup = function () {
            cnv = pcam.createCanvas(pageProp.width, pageProp.height)
            webcam_canvas = cnv;
            capture = pcam.createCapture(pcam.VIDEO)
            capture.elt.id = 'videoCapture'
            capture.hide()
            pcam.pixelDensity(4)
        }

        pcam.draw = function () {
            pcam.scale(1.2)
            pcam.translate(-230, 0);
            pcam.image(capture, 0, 0, capture.width * 1.414, capture.height * 1.414)
            // pcam.filter(pcam.THRESHOLD, .42)
            // pcam.filter(pcam.ERODE)
            // console.log('webcam sketch running')
        }

        pcam.keyPressed = function (e) {
            console.log("webcam key pressed")
            if (e.key == "&" && currentSketch == "webcam") {
                showPrintImage(cnv.canvas);
            }
            if(e.key == '+' && currentSketch == 'webcam') {
                pcam.redraw();
            }
        }

        pcam.mousePressed = function (e) {
            if (e.target.classList.contains('sketch_tag')) {
                let btn = e.target;
                let name = btn.getAttribute('name');
                if (name != 'webcam') {
                    pcam.noLoop();
                } else {
                    newWebcam();
                    pcam.loop();
                }
            }
            console.log("webcam mouse pressed & " + pcam.isLooping())
        }

        function newWebcam(){
            let video = document.querySelector('video')
            console.log(video)
            if(!video){
                capture = pcam.createCapture(pcam.VIDEO)
                capture.elt.id = 'videoCapture'
                capture.hide()
            }
        }
    }
}