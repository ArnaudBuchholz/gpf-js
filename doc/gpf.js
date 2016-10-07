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
            if (doclet.kind === "member") {
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
