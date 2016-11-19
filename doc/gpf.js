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
    //     if (doclet.longname.toLowerCase() === "gpf.error.abstractmethod") {
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
            var customTag = tag.title.split("gpf:")[1];
            var handler = _customTags[customTag];
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
            doclet.access = "private";
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
    } else if (-1 !== ["function", "class"].indexOf(kind)) {
        _checkAccess(doclet);
    }
}

var _reErrorDeclare = /_gpfErrorDeclare\("([a-zA-Z\\]+)", {\n((?:.*\n)*)\s*}\)/g,
    _reErrorItems = /(?:\/\*\*((?:[^*]|\s|\*[^/])*)\*\/)?\s*([a-zA-Z]+):\s*"([^"]*)"/g,
    _reContextualParams = /{(\w+)}/g;

function _generateJsDocForError (name, message, comment) {
    var className = name.charAt(0).toUpperCase() + name.substr(1),
        result,
        params = [],
        param;
    _reContextualParams.lastIndex = 0;
    param = _reContextualParams.exec(message);
    while (param) {
        params.push(param[1]);
        param = _reContextualParams.exec(message);
    }
    result = [
        "/**",
        " * throw {@link gpf.Error." + className + "}",
        " * @method gpf.Error." + name,
        " * @throws {gpf.Error." + className + "}"
    ];
    if (params.length) {
        result.push(" * @param {Object} context Dictionary of parameters used to format the message, must contain");
        params.forEach(function (name) {
            result.push(" * - {String} " + name);
        });
    }
    result.push(" */",
        "/**",
        comment,
        " * @class gpf.Error." + className,
        " */"
    );
    console.log(name, message);
    return result.join("\r\n");
}

function _checkForGpfErrorDeclare (event) {
    _reErrorDeclare.lastIndex = 0;
    var match = _reErrorDeclare.exec(event.source);
    if (match) {
        var // moduleName = match[1],
            errorsPart = match[2],
            errorItem,
            comments = [];
        _reErrorItems.lastIndex = 0;
        errorItem = _reErrorItems.exec(errorsPart);
        while (errorItem) {
            comments.push(_generateJsDocForError(errorItem[2], errorItem[3], errorItem[1]));
            errorItem = _reErrorItems.exec(errorsPart);
        }
        event.source += comments.join("\r\n");
    }
}

// http://usejsdoc.org/about-plugins.html
module.exports = {

    handlers: {

        beforeParse: function (event) {
            _checkForGpfErrorDeclare(event);
        },

        processingComplete: function (event) {
            event.doclets.forEach(_postProcessDoclet);
        }

    }

};
