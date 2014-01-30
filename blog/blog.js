(function () {
    "use strict";

    function onTokenFound (event) {
        // Trim any space token before the first non space one
        var
            type = event.type(),
            token = event.get("token");
        if ("space" === type) {
            if (!this.hasChildNodes()) {
                return;
            }
            // Replace tabs with 4 spaces
            token.replace(/\t/, "    ");
        }
        var tag = document.createElement("span");
        tag.className = type;
        tag.appendChild(document.createTextNode(token));
        this.appendChild(tag);
    }

    function reformatCode (codeElement) {
        var codeClass = codeElement.className;
        if ("javascript" === codeClass) {
            var pre = document.createElement("pre");
            pre.className = "code";
            pre = codeElement.parentNode.insertBefore(pre, codeElement);
            pre.appendChild(codeElement);
            // https://github.com/ArnaudBuchholz/gpf-js/issues/5
            var src = codeElement.innerHTML
                    .replace(/(&lt;)/g, "<")
                    .replace(/(&gt;)/g, ">")
                    .replace(/(&amp;)/g, "&")
                ;
            codeElement.innerHTML = ""; // Easy way to clear this
            gpf.js.tokenize.apply(codeElement, [src, onTokenFound]);
        }
    }

    function waitForLoad () {
        if ("undefined" === typeof gpf
            || !gpf.loaded()
            || document.readyState && document.readyState !== "complete") {
            window.setTimeout(waitForLoad, 100);
            return;
        }
        console.log("Applying blog changes...");
        var
            codes = document.getElementsByTagName("code"),
            idx;
        for (idx = 0; idx < codes.length; ++idx) {
            reformatCode(codes[idx]);
        }
    }
    window.setTimeout(waitForLoad, 0);

}());
