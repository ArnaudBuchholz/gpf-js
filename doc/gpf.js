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
    //     if (doclet.longname.indexOf("gpf.hosts") !== -1
    //         || doclet.longname.indexOf("_GPF_HOST") !== -1
    //         ) {
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
            "exceptions",
            "kind",
            "isEnum",
            "type",
            "properties",
            "readonly"
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
    _handleCustomTags(doclet, doclets);
    if (kind === "member") {
        _addMemberType(doclet);
        _checkAccess(doclet);
    } else if (-1 !== ["function", "typedef", "class"].indexOf(kind)) {
        _checkAccess(doclet);
    }
    _logDoclet(doclet);
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
        params.push(" * - {String} " + param[1]);
        param = _reContextualParams.exec(message);
    }
    if (params.length) {
        params.unshift(" * @param {Object} context Dictionary of parameters used to format the message, must contain");
        params = params.join("\r\n");
    } else {
        params = undefined;
    }
    result = [
        "/**",
        " * throw {@link gpf.Error." + className + "}",
        " * @method gpf.Error." + name,
        " * @throws {gpf.Error." + className + "}",
        params,
        " */",
        "/**",
        comment,
        " * @class gpf.Error." + className,
        params,
        " */"
    ];
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

var _reFileComment = /(?:\/\*\*(?:[^*]|\s\*[^/])*\@file(?:[^*]|\s\*[^/])*\*\/)/g;

function _disableFileComment (event) {
    _reFileComment.lastIndex = 0;
    var match = _reFileComment.exec(event.source),
        fileComment;
    if (match) {
        fileComment = match[0];
        event.source = event.source.replace(fileComment, "/* " + fileComment.substr(2));
    }
}

function _isInsideGpfErrorDeclare (node) {
    var ancestor;
    try {
        ancestor = node.parent.parent.parent;
    } catch (e) {
        return false;
    }
    return ancestor
        && ancestor.type === "ExpressionStatement"
        && ancestor.expression.type === "CallExpression"
        && ancestor.expression.callee.name === "_gpfErrorDeclare"
        && "Property" === node.type;
}

function _visitNode (node, e/*, parser, currentSourceName*/) { //eslint-disable-line max-params

    if (_isInsideGpfErrorDeclare(node)) {
        // This documentation is handled through beforeParse
        e.preventDefault = true;
        return;
    }

}

// http://usejsdoc.org/about-plugins.html
module.exports = {

    astNodeVisitor: {

        visitNode: _visitNode

    },

    handlers: {

        beforeParse: function (event) {
            _disableFileComment(event);
            _checkForGpfErrorDeclare(event);
        },

        processingComplete: function (event) {
            event.doclets.forEach(_postProcessDoclet);
        }

    }

};
