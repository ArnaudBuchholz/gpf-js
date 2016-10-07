"use strict";

// http://usejsdoc.org/about-plugins.html
module.exports = {

    handlers: {

        newDoclet: function (event) {
            var doclet = event.doclet,
                title = [
                    "@",
                    doclet.meta.lineno
                ];
            if (doclet.undocumented) {
                title.push("(u)");
            }
            title.push(": ", doclet.longname, " (", doclet.kind, ")");
            console.log(title.join(""));
if(doclet.meta.lineno === 50) {
    console.log(doclet);
}
            if (doclet.kind === "member" || doclet.kind === "function") {
                if (doclet.undocumented && -1 === doclet.longname.indexOf("~")) {
                    // Generate documentation on the fly for easy cases
                }
                if (!doclet.access) {
                    if (doclet.name.charAt(0) === "_") {
                        doclet.access = "protected";
                    } else {
                        doclet.access = "public";
                    }
                }
            }
        }

    }

};
