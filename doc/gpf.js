"use strict";

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
    //     if (doclet.meta.lineno === 25 || doclet.meta.lineno === 54 || doclet.meta.lineno === 51) {
    //         console.log(doclet);
    //     }
    // }
    // catch (e) {
    //     // ignore
    // }
}

function _findDoclet (doclets, longname) {
    var resultDoclet;
    doclets.every(function (doclet) {
        if (doclet.longname === longname && !doclet.undocumented) {
            resultDoclet = doclet;
            return false;
        }
        return true;
    });
    return resultDoclet;
}

function _findRefDoclet (doclets, doclet, reference) {
    var refLongname = reference;
    if (-1 === refLongname.indexOf("#")) {
        refLongname = doclet.longname.split("#")[0] + "#" + refLongname;
    }
    return _findDoclet(doclets, refLongname);
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
        var refDoclet = _findRefDoclet(doclets, doclet, tag.value);
        if (!refDoclet) {
            throw new Error("invalid reference for @read");
        }
        doclet.returns = [{
            type: refDoclet.type,
            description: refDoclet.description
        }];
        doclet.description = "<i>GET accessor for</i> " + refDoclet.description;
    },

    // Write accessor on a property
    write: function (doclet, tag, doclets) {
        var refDoclet = _findRefDoclet(doclets, doclet, tag.value);
        if (!refDoclet) {
            throw new Error(doclet, "invalid reference for @write");
        }

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
                    console.error(doclet.meta.path + ".js@" + doclet.meta.lineno + ": " + e.message);
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
