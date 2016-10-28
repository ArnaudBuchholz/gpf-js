"use strict";

var path = require("path");

function _logDoclet (doclet) {
    var title = [];
    if (doclet.meta && doclet.meta.lineno) {
        title.push("@", doclet.meta.lineno, ": ");
    }
    if (doclet.undocumented) {
        title.push("(u) ");
    }
    title.push(doclet.longname, " (", doclet.kind, ")");
    console.log(title.join(""));
    // try {
    //     if (doclet.longname === "gpf.isArrayLike") {
    //         console.log(doclet);
    //     }
    // } catch (e) {
    //     // ignore
    // }
}

function _findDoclet (doclets, longname, tag) {
    var resultDoclet;
    doclets.every(function (doclet) {
        if (doclet.longname === longname && !doclet.undocumented) {
            resultDoclet = doclet;
            return false;
        }
        return true;
    });
    if (!resultDoclet) {
        throw new Error("invalid reference for @" + tag.title);
    }
    return resultDoclet;
}

function _findRefDoclet (doclets, doclet, tag) {
    var refLongname = tag.value;
    if (-1 === refLongname.indexOf("#") && -1 !== doclet.longname.indexOf("#")) {
        refLongname = doclet.longname.split("#")[0] + "#" + refLongname;
    }
    return _findDoclet(doclets, refLongname, tag);
}

var _customTags = {

    // Returns the same type with a generic comment
    chainable: function (doclet/*, tag, doclets*/) {
        doclet.returns = [{
            type: {
                names: [doclet.memberof]
            },
            description: "<i>Self reference to allow chaining</i>"
        }];
    },

    // Read accessor on a property
    read: function (doclet, tag, doclets) {
        var refDoclet = _findRefDoclet(doclets, doclet, tag);
        doclet.returns = [{
            type: refDoclet.type,
            description: refDoclet.description
        }];
        doclet.description = "<i>GET accessor for</i> " + refDoclet.description;
    },

    // Write accessor on a property
    write: function (/*doclet, tag, doclets*/) {
        // var refDoclet = _findRefDoclet(doclets, doclet, tag);
    },

    // Same as another doclet
    sameas: function (doclet, tag, doclets) {
        var refDoclet = _findRefDoclet(doclets, doclet, tag);
        [
            "description",
            "params",
            "returns",
            "kind"
        ].forEach(function (propertyName) {
            doclet[propertyName] = refDoclet[propertyName];
        });
    }

};

function _handleCustomTags (doclet, doclets) {
    if (doclet.tags) {
        doclet.tags.forEach(function (tag) {
            var handler = _customTags[tag.title];
            if (undefined !== handler) {
                try {
                    handler(doclet, tag, doclets);
                } catch (e) {
                    console.error(doclet.meta.path + path.sep + doclet.meta.filename + "@" + doclet.meta.lineno + ": "
                        + e.message);
                    console.error(doclet);
                    throw e;
                }
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

function _postProcessDoclet (doclet, index, doclets) {
    var kind = doclet.kind;
    _logDoclet(doclet);
    _handleCustomTags(doclet, doclets);
    if (kind === "member") {
        _addMemberType(doclet);
        _checkAccess(doclet);
    } else if (kind === "function") {
        _checkAccess(doclet);
    }
}

// http://usejsdoc.org/about-plugins.html
module.exports = {

    handlers: {

        processingComplete: function (event) {
            event.doclets.forEach(_postProcessDoclet);
        }

    }

};
