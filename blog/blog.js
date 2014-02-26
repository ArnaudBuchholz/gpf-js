(function () {
    "use strict";

    function onTokenFound (event) {
        // Trim any space token before the first non space one
        var
            that = this,
            type,
            token;
        if (gpf.events && event instanceof gpf.events.Event) {
            type = event.type();
            token = event.get("token");
        } else {
            // Backward compatibility
            type = arguments[0];
            token = arguments[1];
        }
        if ("space" === type) {
            if (!that.hasChildNodes()) {
                return;
            }
            // Replace tabs with 4 spaces
            token.replace(/\t/, "    ");
        }
        var tag = document.createElement("span");
        tag.className = type;
        tag.appendChild(document.createTextNode(token));
        that.appendChild(tag);
    }

    function reformatCode (codeElement) {
        var
            codeClass = codeElement.className,
            pre/*, src, toolbar*/;
        pre = document.createElement("pre");
        pre.className = "code " + codeClass;
        pre = codeElement.parentNode.insertBefore(pre, codeElement);
        pre.appendChild(codeElement);
        if ("javascript" === codeClass) {
            // https://github.com/ArnaudBuchholz/gpf-js/issues/5
            var content = codeElement.innerHTML
                            .replace(/(&lt;)/g, "<")
                            .replace(/(&gt;)/g, ">")
                            .replace(/(&amp;)/g, "&")
                ;
            codeElement.innerHTML = ""; // Easy way to clear this
            if (gpf.tokenize) {
                // Backward compatibility
                gpf.tokenize.apply(codeElement, [content, onTokenFound]);
            } else {
                gpf.js.tokenize.apply(codeElement, [content, onTokenFound]);
            }
/*
    Could be great to have testable samples
            // Insert a toolbar
            toolbar = document.createElement("div");
            toolbar.className = "toolbar";
            pre.insertBefore(toolbar, codeElement);
*/
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
