const WiW = window.innerWidth, WiH = innerHeight;
let pageContainer = document.getElementById("page-container");

var markdownit = window.markdownit()
    .use(markdownitFootnote)
    .use(markdownItAttrs, {
        // optional, these are default options
        leftDelimiter: '{',
        rightDelimiter: '}',
        allowedAttributes: []  // empty array = all attributes are allowed
    });

var request = new XMLHttpRequest();
request.open("GET", "./md/filler.md");

request.addEventListener("readystatechange", function (event) {
    if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
        var response = request.responseText;

        var result = markdownit.render(response);
        pageContainer.innerHTML = result;
        var pagedJs = document.createElement("script");

        pagedJs.src = 'libs/paged.polyfill.js';
        pageContainer.appendChild(pagedJs);

    }
});

request.send();