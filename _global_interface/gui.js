console.log("gui loading")

function loadDefStyles() {
    let randomX = Math.floor(getRandomArbitrary(-100, 100) + 100) + "px";
    let randomY = Math.floor(getRandomArbitrary(-200, 200) + 200) + "px";
    let posX = 360 + "px";
    // let posY = (globalStyleIndex * 65) + "px";
    let posY = 1072 + "px";

    let randomTextColor = "#" + Math.trunc(Math.random() * 16777215).toString(16);
    if (randomTextColor.length == 6) { randomTextColor += "0" }
    let txtColor = "black";

    let randomBckColor = "#" + Math.trunc(Math.random() * 16777215).toString(16);
    if (randomBckColor.length == 6) { randomBckColor += "0" }
    let bckColor = "none"

    // let newStyle = new CalqueStyle(randomX, randomY, 500, "60px", "arial", randomTextColor, randomBckColor);
    let newStyle = new CalqueStyle(posX, posY, 500, "22px", "garamond", txtColor, bckColor);

    listDefStyles.push(newStyle);
    listStyles.push(newStyle);
}

const nbrDefStyles = 8;
preloadStyles(nbrDefStyles);
function preloadStyles(nbr) {
    for (let i = 0; i < nbr; i++) {
        loadDefStyles();
        if (i == nbr - 1) {
            loadDefCalque();
        }
    }
}

function loadDefCalque() {
    console.log("load claque")
    // let randomStyle = Math.trunc(Math.random() * 8);
    for (let i = 0; i < 1; i++) {
        // console.log(i)
        let newCalque = new Calque(listDefStyles[i]);
        listDefCalquesObj.push(newCalque)
        listCalquesObj.push(newCalque)
    }
    return console.log(listDefCalquesObj);
}

let calqueFocusIndex = 0, calqueFocus, calqueFocusObj;

document.addEventListener("click", (e) => focusCalque(e))
function focusCalque(e) {
    console.log(e.target.classList.contains('image_tag'))
    if ((e.target.classList.contains("calque_tag") || e.target.classList.contains("calqueElem")) && !(e.target.classList.contains('image_tag'))) {
        calqueFocusIndex = e.target.name;
        let calqueFocusIndexArr = calqueFocusIndex - 1;
        calqueFocus = listCalques[calqueFocusIndexArr];
        calqueFocusObj = listCalquesObj[calqueFocusIndexArr];
        console.log(listCalquesObj[calqueFocusIndexArr])
        displayCalqueStyle();
        txtHandle.moveTo(calqueFocus)
    }
}

function displayCalqueStyle() {
    let calqueFocusIndexArr = calqueFocusIndex - 1;

    let cssInputs = Array.from(document.querySelectorAll(".calqueCssInput"))
    let nameCalqueFocus = document.querySelector("#name-calque-focus");
    nameCalqueFocus.innerHTML = "Calque " + calqueFocusObj.calqueIndex;
    for (let i = 0; i < cssInputs.length; i++) {
        cssInputs[i].value = Object.values(calqueFocusObj.pageElemStyle.onlyCss)[i]
    }

    // Update les Tags
    for (let i = 0; i < listCalquesTags.length; i++) {
        if (listCalquesTags[i].classList.contains("active_calque_tag")) {
            listCalquesTags[i].classList.remove("active_calque_tag")
        }
    }
    listCalquesTags[calqueFocusIndexArr].classList.add("active_calque_tag")

    // Update les styles Elements 
    //active-calque-style
    for (let i = 0; i < listStyles.length; i++) {
        if (listStyles[i].uiStyleDomElem.classList.contains("active-calque-style")) {
            listStyles[i].uiStyleDomElem.classList.remove("active-calque-style");
        }
    }
    let calqueFocusStyle = calqueFocusObj.pageElemStyle.styleIndex;
    listStyles[calqueFocusStyle - 1].uiStyleDomElem.classList.add("active-calque-style")
}

function addCalque() {
    let randomStyle = listStyles[Math.trunc(Math.random() * nbrDefStyles)];
    // console.log(randomStyle)
    let newCalque = new Calque(randomStyle);
    listDefCalquesObj.push(newCalque)
    listCalquesObj.push(newCalque)
}

function addStyle() {
    let cssInputs = Array.from(document.querySelectorAll(".calqueCssInput"))

    let newStyle = new CalqueStyle(cssInputs[0].value, cssInputs[1].value, cssInputs[2].value, cssInputs[3].value, cssInputs[4].value, cssInputs[5].value, cssInputs[6].value)
    listStyles.push(newStyle);
}

function selectStyle(e) {
    let targetStyle = listStyles[e.target.name]
    calqueFocusObj.pageElemStyle = targetStyle;
    calqueFocusObj.updateStyle();
    for (let i = 0; i < listStyles.length; i++) {
        if (listStyles[i].uiStyleDomElem.classList.contains("active-calque-style")) {
            listStyles[i].uiStyleDomElem.classList.remove("active-calque-style");
        }
    }
    let calqueFocusStyle = calqueFocusObj.pageElemStyle.styleIndex;
    listStyles[calqueFocusStyle - 1].uiStyleDomElem.classList.add("active-calque-style");
    displayCalqueStyle();
}

function modifyCurrentStyle() {
    // console.log(document.querySelector('#fontfamily_menu').value)
    // Recupurer les valeurs dans les inputs
    let cssInputs = Array.from(document.querySelectorAll(".calqueCssInput"))

    let indexCss = 0;

    let cssKeys = Object.keys(listStyles[calqueFocusObj.pageElemStyle.styleIndex - 1].onlyCss)
    console.log(cssKeys)

    for (const elem of cssKeys) {
        listStyles[calqueFocusObj.pageElemStyle.styleIndex - 1].onlyCss[elem] = cssInputs[indexCss].value
        indexCss++;
    }
    calqueFocusObj.updateStyle();
}

function removeCalque() {
    //remove page dom elem
    calqueFocusObj.pageElem.remove();
    listCalquesTags[calqueFocusObj.calqueIndex - 1].classList.remove("calque_tag")
    listCalquesTags[calqueFocusObj.calqueIndex - 1].innerHTML = "";
    // listCalquesTags[calqueFocusObj.calqueIndex - 1] = undefined;
    listCalquesTags[calqueFocusObj.calqueIndex - 1].classList.add("emptyTag");
    listCalquesTags[calqueFocusObj.calqueIndex - 1].contentEditable = false;
}

function updateDisplayPosition(newX, newY) {
    let css_left_input = document.querySelector("#css_left_input");
    let css_top_input = document.querySelector("#css_top_input");

    css_left_input.value = newX;
    css_top_input.value = newY;

    listStyles[calqueFocusObj.pageElemStyle.styleIndex - 1].onlyCss["x"] = newX;
    listStyles[calqueFocusObj.pageElemStyle.styleIndex - 1].onlyCss["y"] = newY;
}


function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

let last_ft_family = 'arial';

document.querySelector("#fontfamily_menu").addEventListener("change", (e) => {
    let ft_family = e.target.value;
    last_ft_family = ft_family;
})

document.addEventListener("click", (e) => {
    if ((document.querySelector("#fontfamily_menu").value == "") && (e.target != document.querySelector("#fontfamily_menu"))) {
        document.querySelector("#fontfamily_menu").value = last_ft_family;
    }
    if (e.target == document.querySelector("#fontfamily_menu")) {
        e.target.value = "";
    }
})


// Drag text handle
// Drag text handle
// Drag text handle

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("calqueElem")) {
        calqueFocus = e.target;
        txtHandle.moveTo(e.target)
    }
})
// console.log(txtHandle)
let dragTxt = false;
txtHandle.handleObj.addEventListener("mousedown", (e) => {
    // console.log(e)
    dragTxt = true;
})

txtHandle.handleObj.addEventListener("mouseup", (e) => {
    // console.log(e)
    dragTxt = false;
})

document.addEventListener("mousemove", (e) => {
    if (dragTxt) {
        document.body.style.userSelect = "none";
        // console.log(global_interface.style.pointerEvents)
        let mouseX = e.clientX
        let mouseY = e.clientY
        txtHandle.dragObj(mouseX, mouseY);
    } else {
        document.body.style.userSelect = "auto";
        // console.log(global_interface.style.pointerEvents)
    }
})

// DRAG UI
// DRAG UI
// DRAG UI


let globalGrabStat = true;
let globalDragTarget;
let allDragElem = document.querySelectorAll(".drag")
let allHandleElem = document.querySelectorAll(".handle")

for (const elem of allHandleElem) {
    elem.onmousedown = (event) => {
        globalGrabStat = false;
        globalDragTarget = event.target;
        document.body.style.userSelect = "none";
    }
}

document.onmousemove = (event) => {
    if (!globalGrabStat) {
        let rectHandle = globalDragTarget.getBoundingClientRect();
        let offX = rectHandle.width / 2 + 8;
        let offY = rectHandle.height / 2 + 8;
        globalDragTarget.parentNode.style.left = event.clientX - offX + "px";
        globalDragTarget.parentNode.style.top = event.clientY - offY + "px";
    }
}

for (const elem of allDragElem) {
    elem.onmouseup = () => {
        globalGrabStat = true;
        document.body.style.userSelect = "auto";
    }
}


// SWITCHING WORKING LAYER

let layerButton = document.querySelectorAll(".layer-button");
let modifierLayers = document.querySelectorAll(".modifier-layer");

for (const elem of layerButton) {
    elem.addEventListener("click", (event) => toggleModifierLayer(event))
}

// [0] txt   &   [1] canvas


function toggleModifierLayer(e) {
    if (!e.target.classList.contains("active-layer-signal")) {
        if (e.target.id == "canvas-signal-button") {
            showCnvElements(true)

            layerButton[0].classList.remove("active-layer-signal")
            layerButton[1].classList.add("active-layer-signal")

            modifierLayers[0].classList.remove("active-modifier-layer")
            modifierLayers[1].classList.add("active-modifier-layer")
        } else {
            showCnvElements(false)

            layerButton[1].classList.remove("active-layer-signal")
            layerButton[0].classList.add("active-layer-signal")

            modifierLayers[1].classList.remove("active-modifier-layer")
            modifierLayers[0].classList.add("active-modifier-layer")
        }
    }
}


let sketch2print_overlay = document.querySelector("#sketch2print-overlay")
let visible_overlay_button = document.querySelector("#visible-overlay-button")
let global_interface = document.querySelector("#global-interface")
// console.log(visible_overlay_button)

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
    if (elemContent == "Preview") {
        visible_overlay_button.innerHTML = "Hover";
        global_interface.classList.remove("global-interface-visible")
        global_interface.classList.add("global-interface-hidden")
        txtHandle.handleObj.style.display = "none";
    } else if (elemContent == "Hover") {
        visible_overlay_button.innerHTML = "Preview";
        global_interface.classList.remove("global-interface-hidden")
        global_interface.classList.add("global-interface-visible")
        txtHandle.handleObj.style.display = "block";
    }
}

// BTN pour centrer le canvas

let placeCnvBtn = document.querySelector("#placeCanvas");
placeCnvBtn.addEventListener("click", (e) => {
    let btn = e.target.innerHTML;
    if (btn == "&lt;") {
        placeCanvas(false)
        placeCnvBtn.innerHTML = "&gt;";
    } else if (btn == "&gt;") {
        placeCanvas(true)
        placeCnvBtn.innerHTML = "&lt;"
    }
})

function placeCanvas(center) {
    if (!center) {
        onScreenCanvasContainer.style.left = 'calc(50vw - ' + pageProp.width / 2 + 'px)'
    }
    else {
        onScreenCanvasContainer.style.left = '75vw'
    }
}

function showCnvElements(show) {
    if (show) {
        showCanvas = true;
        onScreenCanvasContainer.style.display = "block";
        placeCnvBtn.style.display = "block";
    } else {
        showCanvas = false;
        onScreenCanvasContainer.style.display = "none";
        placeCnvBtn.style.display = "none";
    }
}


document.addEventListener("keydown", (e) => {
    if(e.key == "5"){
        onScreenCanvasContainer.innerHTML = "";
        let newSketch = new p5(listSkt[1], onScreenCanvasContainer)
        listSketches.push(newSketch)
    }
})