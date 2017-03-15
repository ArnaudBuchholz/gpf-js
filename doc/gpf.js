"use strict";

let verbose;
if ([].slice.call(process.argv).some(arg => arg === "--verbose")) {
    verbose = t => console.log(`[gpf doc plugin] ${t}`);
} else {
    verbose = () => {};
}
verbose("loaded");

function _logDoclet (doclet) {
    let title = [];
    if (doclet.meta && doclet.meta.lineno) {
        title.push(`@${doclet.meta.lineno}: `);
    }
    if (doclet.undocumented) {
        title.push("(u) ");
    }
    title.push(doclet.longname, ` (${doclet.kind})`);
    console.log(title.join(""));
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

const _customTags = {

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
        let refDoclet = _findRefDoclet(doclets, doclet, tag);
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

function _handleCustomTags (doclet, doclets) {
    if (doclet.tags) {
        doclet.tags.forEach(tag => {
            let customTag = tag.title.split("gpf:")[1],
                handler = _customTags[customTag];
            if (undefined !== handler) {
                try {
                    verbose(customTag);
                    handler(doclet, tag, doclets);
                } catch (e) {
                    console.error(`${doclet.meta.path}/${doclet.meta.filename}@${doclet.meta.lineno}:${e.message}`);
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

function _postProcessDoclet (doclet, index, doclets) {
    let kind = doclet.kind;
    _handleCustomTags(doclet, doclets);
    if ("member" === kind) {
        _addMemberType(doclet);
        _checkAccess(doclet);
    } else if (["function", "typedef", "class"].includes(kind)) {
        _checkAccess(doclet);
    }
    if (doclet.isEnum) {
        _cleanEnum(doclet);
    }
    _logDoclet(doclet);
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
            verbose(`error: ${errorItem[2]}`);
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
            verbose(">> beforeParse");
            _disableFileComment(event);
            _checkForGpfErrorDeclare(event);
            verbose("<< beforeParse");
        },

        processingComplete: function (event) {
            verbose(">> processingComplete");
            event.doclets.forEach(_postProcessDoclet);
            verbose(">> processingComplete");
        }

    }

};
