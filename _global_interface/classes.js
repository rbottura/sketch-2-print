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

const ptNbr = 17;

const pageDummy = document.querySelectorAll(".pagedjs_area")[0];
// console.log(pageDummy)

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
        
        this.pageElem.name = this.calqueIndex;
        // this.pageElem.innerHTML = "calque" + this.calqueIndex;
        
        // pour édition critérium
        this.pageElem.innerHTML = "this is editable text";
        
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

let listCnv = [];
let save = 0;

let sketchIndex = 1;
let grphc, showCanvas = true;




let savedImg = [];
function showPrintImage(canvas) {
    imageTagControl(true, false)
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