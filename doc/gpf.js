"use strict";

function _logDoclet (doclet) {
    var title = [
            "@",
            doclet.meta.lineno
        ];
    if (doclet.undocumented) {
        title.push("(u)");
    }
    title.push(": ", doclet.longname, " (", doclet.kind, ")");
    console.log(title.join(""));
}

var _customTags = {

    // Returns the same type with a generic comment
    chainable: function (doclet/*, tag*/) {
        doclet.returns = [{
            type: {
                names: [doclet.memberof]
            },
            description: "Chainable"
        }];
    }

};

function _handleCustomTags (doclet) {
    if (doclet.tags) {
        doclet.tags.forEach(function (tag) {
           var handler = _customTags[tag.title];
            if (undefined !== handler) {
                handler(doclet, tag);
            }
        });
    }
}

function _addMemberType (doclet) {
    if (!doclet.type) {
        // type: { names: [ 'String' ] }
        var codeType = doclet.meta.code.type,
            type;
        if (codeType === "Literal") {
            type = typeof doclet.meta.code.value;
            type = type.charAt(0).toUpperCase() + type.substr(1);
        } else if (codeType === "ArrayExpression") {
            type = "Array";
        } else if (codeType === "ObjectExpression") {
            type = "Object";
        }
        doclet.type = {
            names: [
                type
            ]
        };
    }
}

function _checkAccess (doclet) {
    if (!doclet.access) {
        if (doclet.name.charAt(0) === "_") {
            doclet.access = "protected";
        } else {
            doclet.access = "public";
        }
    }
}

// http://usejsdoc.org/about-plugins.html
module.exports = {

    handlers: {

        newDoclet: function (event) {
            var doclet = event.doclet,
                kind = doclet.kind;
            _logDoclet(doclet);
            _handleCustomTags(doclet);
            if (kind === "member") {
                _addMemberType(doclet);
                _checkAccess(doclet);
            } else if (kind === "function") {
                _checkAccess(doclet);
            }
            // if(doclet.meta.lineno === 126 || doclet.meta.lineno === 92) {
            //     console.log(doclet);
            // }
        }

    }

};
