## sketch-2-print

Dans l'état actuel des choses, le site est pensé pour la gestion d'un document d'une seule et unique page d'un format prédéfini.
Cela ne veut pas dire qu'il n'est pas en projet d'exploiter la capacité inhérente à paged.js de créer un document à plusieurs pages, avec un format à définir dans une boite de dialogue précédant l'interface principale.

Les dimensions prédéfinis sont les formats standard ISO A5, A4, A3, A2 et A1. 

Cependant paged.js ne fait pas de gestion de cadrage dans le cas où les dimensions deviennent plus grande que la hauteur de l'écran utilisé. Ce problème intervient dès le format A4.

(il doit être possible de faire quelque chose de plus propre que la formule ci-dessous car le facteur d'agrandissement entre le format A5 vers A4 est égale à celui entre A4 et A3 et ainsi de suite, 1.4141..., donc j'ai cherché à créer une objet avec pour chaque valeur de taille de document, un facteur d'agrandissement qui suivrait une augmentation linéaire ce qui est presque le cas mais pas tout à fait). 

Une fois le calcul fait, la fonction CSS scale() récupère et applique cette valeur, l'intègre dans une variable elle même placée dans une chaine de caractères utilisé pour écrire une nouvelle balise style ajouté dans le head du document de travail. 

```JavaScript
const paperScalingRatio = {
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

    first_page = document.querySelector(".pagedjs_first_page");

    let newScaleStyle = document.createElement("style");
    newScaleStyle.innerHTML = scaleCSS;
    document.head.appendChild(newScaleStyle)

    first_page.classList.add("pageScale");
}
```
Attention ! Pour que le scale soit bien appliqué, il faut préciser en amont que le document qui subira ce scaling soit transformé depuis le correct point d'ancrage, un point situé en haut à gauche de l'objet cible.
La ligne suivante permets très grossièrement de placer le centre vertical du document au centre vertical de l'écran. 

```CSS
.pagedjs_first_page {
    transform-origin: top left;
    margin-left: calc(50vw - 230px);    
}
```


### Gestion des objets avec interface HTML

Paged.js, au chargement, écrase tout le contenu du body pour appliquer avec soin tous les paramètres nécessaires à l'affichage du document. Il est donc impossible (ou je ne sais pas comment faire) de "hardcoder" une interface HTML dans le document de travail.
Je décide de passer par un second document, pour l'instant nommé "global_interface".
Un autre ensemble de fichiers html, css et js concentrés sur la création et la manipulation des futurs éléments affichés et modifiables.
Heuresement pour moi, les requêtes XML, que j'emploie avec l'API Fetch, peuvent parfaitement récupérer des données textes du format .html ou .css .

```javascript
function getGUI(){
    fetch('./_global_interface/index.html')
        .then(response => {
            return response.text();
        }).then(html => {
            let htmlContent = html;
            fetch('./_global_interface/global_ui.css')
                .then(response => {
                    return response.text()
                }).then(css => {
                    let cssContent = css;
                    displayInterface(htmlContent, cssContent)
                })
            })
}


function displayInterface(html, css) {

    let htmlContent = document.createElement("div")
    htmlContent.innerHTML = html;

    let interfaceHtml = htmlContent.querySelector("#global-interface");
    document.body.appendChild(interfaceHtml)

    let interfaceCss = document.createElement("style");
    interfaceCss.innerHTML = css;
    document.head.appendChild(interfaceCss)

    // load scripts for interface 
    let interfaceScript = document.createElement("script")
    interfaceScript.src = "./_global_interface/gui.js"
    
    let interfaceScript2 = document.createElement("script")
    interfaceScript2.src = "./_global_interface/classes.js";
    
    let interfaceScript3 = document.createElement("script")
    interfaceScript3.src = "./_global_interface/altSketches.js";

    document.body.appendChild(interfaceScript2)
    setTimeout(() => {document.body.appendChild(interfaceScript3)}, 150)
    setTimeout(() => {document.body.appendChild(interfaceScript)}, 300)
}
```

J'en profite également pour insérer les script de l'interface à l'ensemble.
NB : gui.js contient l'ensemble des fonctions de gestions des objets et l'actualisation des données par évènements.  
classes.js contient les déclarations des constructeurs d'objets pour les calques, les styles de calques et la poignée de déplacement.
altSketches.js est un script temporaire créer dans le but de tester différentes manières de gérer des instances de sketch p5.





Le bloc de code ci-dessous vient attraper l'évènement window.print avant et après son appel. L'évènement beforeprint prévient de l'apparition de l'interface (global_interface) sur le document imprimable au moment de son téléchargement en .pdf en cachant tous les blocs html superflux, et en désactivant le scaling initialement appliqué. L'évènement afterprint vient tout simplement ré-appliquer ce qui venait d'être modifier pour l'impression et ainsi repasser en mode travail.

```js
addEventListener("beforeprint", () => {
    first_page.style.transform = "none";
    toggleDisplayOverlay(visible_overlay_button.innerHTML);

    showCnvElements(false)
})

addEventListener("afterprint", () => {
    first_page.style.transform = "scale("+ pageRatio +")";
    toggleDisplayOverlay(visible_overlay_button.innerHTML);
    
    showCnvElements(true)
})
```