"use strict";

const
    path = require("path"),
    trace = t => console.log(`[gpf doc plugin] ${t}`);

trace("loaded");

function _logDoclet (doclet) {
    let title = [];
    if (doclet.meta && doclet.meta.lineno) {
        let relativePath = doclet.meta.path.split(`gpf-js${path.sep}src`)[1];
        if (relativePath) {
            relativePath = relativePath.substr(1) + path.sep;
        }
        title.push(`${relativePath}${doclet.meta.filename}@${doclet.meta.lineno}: `);
    }
    if (doclet.undocumented) {
        title.push("(u) ");
    }
    title.push(doclet.longname, ` (${doclet.kind})`);
    trace(title.join(""));
}

function _findDoclet (doclets, longname, tag) {
    let resultDoclet;
    if (doclets.every(doclet => {
        if (doclet.longname === longname && !doclet.undocumented) {
            resultDoclet = doclet;
            return false;
        }
        return true;
    })) {
        throw new Error(`invalid reference for @${tag.title}`);
    }
    return resultDoclet;
}

function _findRefDoclet (doclets, doclet, tag) {
    let refLongname = tag.value;
    if (!refLongname.includes("#") && doclet.longname.includes("#")) {
        refLongname = doclet.longname.split("#")[0] + "#" + refLongname;
    }
    return _findDoclet(doclets, refLongname, tag);
}

const _tags = {

    // Returns the same type with a generic comment
    "gpf:chainable": function (doclet/*, tag, doclets*/) {
        doclet.returns = [{
            type: {
                names: [doclet.memberof]
            },
            description: "<i>Self reference to allow chaining</i>"
        }];
    },

    // Read accessor on a property
    "gpf:read": function (doclet, tag, doclets) {
        let refDoclet = _findRefDoclet(doclets, doclet, tag);
        doclet.returns = [{
            type: refDoclet.type,
            description: refDoclet.description
        }];
        doclet.description = "<i>GET accessor for</i> " + refDoclet.description;
    },

    // Write accessor on a property
    "gpf:write": function (/*doclet, tag, doclets*/) {
        // var refDoclet = _findRefDoclet(doclets, doclet, tag);
    },

    // Same as another doclet
    "gpf:sameas": function (doclet, tag, doclets) {
        let refDoclet = _findRefDoclet(doclets, doclet, tag);
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
        ].forEach(propertyName => {
            doclet[propertyName] = refDoclet[propertyName];
        });
    }

};

function _handleTags (doclet, doclets) {
    let tags = [];
    if (doclet.tags) {
        doclet.tags.forEach(tag => {
            let handler = _tags[tag.title];
            if (undefined !== handler) {
                try {
                    tags.push(tag.title);
                    handler(doclet, tag, doclets);
                } catch (e) {
                    console.error(`${doclet.meta.path}/${doclet.meta.filename}@${doclet.meta.lineno}:${e.message}`);
                    console.error(doclet);
                    throw e;
                }
            }
        });
    }
    return tags;
}

function _addMemberType (doclet) {
    if (!doclet.type) {
        // type: { names: [ 'String' ] }
        let codeType = doclet.meta.code.type,
            type;
        if ("Literal" === codeType) {
            type = typeof doclet.meta.code.value;
            type = type.charAt(0).toUpperCase() + type.substr(1);
        } else if ("ArrayExpression" === codeType) {
            type = "Array";
        } else if ("ObjectExpression" === codeType) {
            type = "Object";
        }
        doclet.type = {names: [type || "Unknown"]};
    }
}

function _checkAccess (doclet) {
    if (!doclet.access) {
        doclet.access = "_" === doclet.name.charAt(0) ? "private" : "public";
    }
}

const _enumType = {names: ["enum"]};

function _cleanEnum (doclet) {
    // Remove default value from documentation and update type
    doclet.type = _enumType;
    doclet.properties.forEach(property => {
        delete property.defaultvalue;
        property.type = _enumType;
    });
}

function _checkImplements (doclet, doclets) {
    if (!doclet.implements) {
        return;
    }
    trace(`\t@implements: ${doclet.implements.join(",")}`);
    doclet.implements.forEach(interfaceName => {
        const interfaceDoclet = _findDoclet(doclets, interfaceName, {title: "implements"});
        /* APPEND to description
         *
         * <h3>Implementated in<h3><ul>
         *     <li>{@link this class name}</li>
         * </ul>
         */
        // trace("\t" + interfaceDoclet.description);
        // trace("\t\t" + Object.keys(interfaceDoclet));
    });
}

const _kinds = {

    member: doclet => {
        _addMemberType(doclet);
        _checkAccess(doclet);
    },

    "function": _checkAccess,
    "typedef": _checkAccess,

    "class": (doclet, doclets) => {
        _checkAccess(doclet);
        _checkImplements(doclet, doclets);
    }

};

function _postProcessDoclet (doclet, index, doclets) {
    let kindHandling = _kinds[doclet.kind],
        handledTags = _handleTags(doclet, doclets);
    if (kindHandling) {
        kindHandling(doclet, doclets);
    }
    if (doclet.isEnum) {
        _cleanEnum(doclet);
    }
    _logDoclet(doclet);
    if (handledTags.length) {
        trace(`\t@${handledTags.join(", @")}`);
    }
}

const
    _reErrorDeclare = /_gpfErrorDeclare\("([a-zA-Z\\]+)", {\n((?:[^}]|}[^)]|\n)*)\s*}\)/g,
    _reErrorItems = /(?:\/\*\*((?:[^*]|\s|\*[^/])*)\*\/)?\s*([a-zA-Z]+):\s*"([^"]*)"/g,
    _reContextualParams = /{(\w+)}/g;

function _generateJsDocForError (name, message, comment) {
    let className = name.charAt(0).toUpperCase() + name.substr(1),
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
    return [
        "/**",
        ` * throw {@link gpf.Error.${className}}`,
        ` * @method gpf.Error.${name}`,
        ` * @throws {gpf.Error.${className}}`,
        params,
        " */",
        "/**",
        comment,
        ` * @class gpf.Error.${className}`,
        params,
        ` * @see gpf.Error.${name}`,
        " */"
    ].join("\r\n");
}

function _checkForGpfErrorDeclare (event) {
    _reErrorDeclare.lastIndex = 0;
    let match = _reErrorDeclare.exec(event.source);
    if (match) {
        let // moduleName = match[1],
            errorsPart = match[2],
            errorItem,
            comments = [];
        _reErrorItems.lastIndex = 0;
        errorItem = _reErrorItems.exec(errorsPart);
        while (errorItem) {
            trace(`error: ${errorItem[2]}`);
            comments.push(_generateJsDocForError(errorItem[2], errorItem[3], errorItem[1]));
            errorItem = _reErrorItems.exec(errorsPart);
        }
        event.source += comments.join("\r\n");
    }
}

const _reFileComment = /(?:\/\*\*(?:[^*]|\s\*[^/])*\@file(?:[^*]|\s\*[^/])*\*\/)/g;

function _disableFileComment (event) {
    _reFileComment.lastIndex = 0;
    let match = _reFileComment.exec(event.source),
        fileComment;
    if (match) {
        fileComment = match[0];
        event.source = event.source.replace(fileComment, `/* ${fileComment.substr(2)}`);
    }
}

function _isInsideGpfErrorDeclare (node) {
    let ancestor;
    try {
        ancestor = node.parent.parent.parent;
    } catch (e) {
        return false;
    }
    return ancestor
        && "ExpressionStatement" === ancestor.type
        && "CallExpression" === ancestor.expression.type
        && "_gpfErrorDeclare" === ancestor.expression.callee.name
        && "Property" === node.type;
}

function _visitNode (node, e/*, parser, currentSourceName*/) { //eslint-disable-line max-params

    if (_isInsideGpfErrorDeclare(node)) {
        // This documentation is handled through beforeParse
        e.preventDefault = true;
    }

}

// http://usejsdoc.org/about-plugins.html
module.exports = {

    astNodeVisitor: {

        visitNode: _visitNode

    },

    handlers: {

        beforeParse: function (event) {
            trace(`>> beforeParse(${event.filename})`);
            _disableFileComment(event);
            _checkForGpfErrorDeclare(event);
            trace(`>> beforeParse(${event.filename})`);
        },

        processingComplete: function (event) {
            trace(">> processingComplete");
            event.doclets.forEach(_postProcessDoclet);
            trace("<< processingComplete");
        }

    }

};
