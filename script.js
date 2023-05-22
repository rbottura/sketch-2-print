let paperScalingRatio = {
    A5: 0.5,
    A4: 1.4,
    A3: 2.2,
    A2: 3.1,
    A1: 4,
}

let pageRatio = 0;
console.log(pageRatio)
let scaleCSS;

let first_page;
let pageProp = {
    width: 0,
    height: 0, 
};

window.onload = function () {
    console.log('script laoding')

    let markdownit = window.markdownit({
        // Options for markdownit
        langPrefix: 'language-fr',
        // You can use html markup element
        html: true,
        typographer: true,
        // Replace english quotation by french quotation
        quotes: ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'],
    })
        .use(markdownitContainer)
        .use(markdownitSpan)
        .use(markdownItAttrs, {
            // optional, these are default options
            leftDelimiter: '{',
            rightDelimiter: '}',
            allowedAttributes: [] // empty array = all attributes are allowed
        });

    let request = new XMLHttpRequest();
    request.open("GET", "md/filler.md");

    request.addEventListener("readystatechange", function (event) {
        if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
            var response = request.responseText;

            var result = markdownit.render(response);
            console.log(document.body)
            document.body.innerHTML = result;

            // Call each script one by one
            loadScript("vendors/js/paged.polyfill.js")
                .then(script => loadScript("vendors/js/regex-typo.js"))
                .then(() => { setTimeout(() => { getPageInfo() }, 150) })
                .then(() => { setTimeout(() => { getGUI() }, 300) })

            //add the paged.js css
            var pagedCss = document.createElement("link");
            pagedCss.href = "vendors/css/paged-preview.css";
            pagedCss.type = "text/css";
            pagedCss.rel = "stylesheet";
            document.head.appendChild(pagedCss);
        }
    });

    request.send();

    // document.addEventListener("click", () => { console.log(request) })

    // Create a promise
    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            let script = document.createElement('script');
            script.src = src;

            script.onload = () => resolve(script);
            script.onerror = () => reject(new Error(`Script load error for ${src}`));

            document.body.appendChild(script);
        });
    }

    // const lol = 2;
    function getPageInfo() {
        first_page = document.querySelector(".pagedjs_first_page");
        // first_page.classList.remove('pagedjs_right_page')

        pageRatio = Math.pow((0.68), paperScalingRatio["A3"]);

        let newPageWidth = first_page.getBoundingClientRect().width * pageRatio;
        pageProp.width = newPageWidth
        pageProp.height = first_page.getBoundingClientRect().height * pageRatio;

        scaleCSS = ".pageScale{ transform: scale(" + pageRatio + "); position: relative; left: calc(50vw - +" + (pageProp.width / 2) + "px)}"

        let newScaleStyle = document.createElement("style");
        newScaleStyle.innerHTML = scaleCSS;
        document.head.appendChild(newScaleStyle)

        first_page.classList.add("pageScale");
    }

    function getGUI() {
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
        // alert("Dans de rare cas, l'affichage de la page peut présenter un problème de proportions, si cela se produit, vérifiez et passez la mise à l'échelle de votre moniteur à 125% puis re-chargez le site ! ");
        let htmlContent = document.createElement("div")
        htmlContent.innerHTML = html;

        let interfaceHtml = htmlContent.querySelector("#global-interface");
        // console.log(interfaceHtml)
        document.body.appendChild(interfaceHtml)

        let interfaceCss = document.createElement("style");
        interfaceCss.innerHTML = css;
        document.head.appendChild(interfaceCss)

        // load scripts for interface 
        let scripts = []
        let paths = ["./_global_interface/classes.js", "./_global_interface/altSketches.js", "./_global_interface/gui.js"]

        for (let i = 0; i < 3; i++) {
            let newScript = document.createElement('script')
            newScript.src = paths[i]
            scripts.push(newScript)
        }

        document.body.appendChild(scripts[0]).addEventListener('load', () => {
            document.body.appendChild(scripts[1]).addEventListener('load', () => {
                document.body.appendChild(scripts[2])
            })
        })
    }


    document.addEventListener("click", (e) => {
        console.log(e.clientX)
        // console.log(pageRatio)
    })

    addEventListener("beforeprint", () => {
        first_page.style.transform = "none";
        first_page.style.left = "0px";
        toggleDisplayOverlay(visible_overlay_button.innerHTML);
        
        showCnvElements(false)
    })
    
    addEventListener("afterprint", () => {
        first_page.style.transform = "scale(" + pageRatio + ")";
        first_page.style.left = "calc(50vw - +" + (pageProp.width / 2) + "px)";
        toggleDisplayOverlay(visible_overlay_button.innerHTML);

        showCnvElements(true)
    })
}