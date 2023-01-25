## sketch-2-print

Ajout de la documentation !



```
var paperScalingRatio = {
    A5: 0.5,
    A4: 1.4,
    A3: 2.2,
    A2: 3.1,
    A1: 4,
}

let pageRatio;
let scaleCSS;

let first_page;
function getPageInfo() {
    pageRatio = Math.pow((0.68), paperScalingRatio["A3"]);
    scaleCSS = ".pageScale{ transform: scale(" + pageRatio + ") }"
```