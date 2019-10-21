"use strict";

const
    START = 0,
    JSDOC_COMMENT = "/**",
    path = require("path"),
    tools = require("../res/tools"),
    trace = text => console.log(`[gpf doc plugin] ${text}`),

    GPF_SRC_BASEPATH = `gpf-js${path.sep}src${path.sep}`,

    relativeFilename = filename => filename.substring(filename.indexOf(GPF_SRC_BASEPATH) + GPF_SRC_BASEPATH.length),
    relativeFilenameAt = meta => `${relativeFilename(meta.path + path.sep + meta.filename)}@${meta.lineno}`,

    logDoclet = doclet => {
        const
            title = [],
            meta = doclet.meta;
        if (meta && meta.lineno) {
            title.push(`${relativeFilenameAt(meta)}: `);
        }
        if (doclet.undocumented) {
            title.push("(u) ");
        }
        title.push(doclet.longname, ` (${doclet.kind})`);
        trace(title.join(""));
    },

    docletNotFound = (tagTitle, longname) => {
        throw new Error(`invalid reference '${longname}' for ${tagTitle}`);
    },

    findDoclet = (doclets, longname, tagTitle) =>
        doclets.find(doclet => doclet.longname === longname && !doclet.undocumented)
        || docletNotFound(tagTitle, longname),

    findRefDoclet = (doclets, doclet, tag) => {
        let refLongname = tag.value;
        if (!refLongname.includes("#") && doclet.longname.includes("#")) {
            refLongname = doclet.longname.split("#")[START] + "#" + refLongname;
        }
        return findDoclet(doclets, refLongname, tag.title);
    },

    attributesRestriction = {
        "attribute": "Only for {@link gpf.attributes.Attribute}",
        "class": "Only for class level (see {@link gpf.attributes.ClassAttribute})",
        "member": "Only for member level (see {@link gpf.attributes.MemberAttribute})",
        "unique": "Only once (see {@link gpf.attributes.UniqueAttribute})"
    },

    gpfTags = {

        // Returns the same type with a generic comment
        "gpf:chainable": doclet => {
            doclet.returns = [{
                type: {
                    names: [doclet.memberof]
                },
                description: "<i>Self reference to allow chaining</i>"
            }];
        },

        // Read accessor on a property
        "gpf:read": (doclet, tag, doclets) => {
            const refDoclet = findRefDoclet(doclets, doclet, tag);
            doclet.returns = [{
                type: refDoclet.type,
                description: refDoclet.description
            }];
            doclet.description = "<i>GET accessor for</i> " + refDoclet.description;
        },

        // Write accessor on a property
        "gpf:write": function (/*doclet, tag, doclets*/) {
            // const refDoclet = findRefDoclet(doclets, doclet, tag);
        },

        // Same as another doclet
        "gpf:sameas": (doclet, tag, doclets) => {
            const refDoclet = findRefDoclet(doclets, doclet, tag);
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
                if (propertyName !== "description" || !Object.prototype.hasOwnProperty.call(doclet, propertyName)) {
                    doclet[propertyName] = refDoclet[propertyName];
                }
            });
        },

        // Attribute usage restrictions
        "gpf:attribute-restriction": (doclet, tag/*, doclets*/) => {
            doclet.description += "<h3>Usage restriction</h3><ul><li>"
                + tag.value.split(",").map(type => attributesRestriction[type]).join("</li><li>")
                + "</li></ul>";
        }

    },

    handleGpfTags = (doclet, doclets) => (doclet.tags || []).filter(tag => {
        let handler = gpfTags[tag.title];
        if (undefined !== handler) {
            try {
                handler(doclet, tag, doclets);
                return true;
            } catch (e) {
                const meta = doclet.meta;
                console.error(`${relativeFilenameAt(meta)}:${e.message}`);
                console.error(doclet);
            }
        }
        return false;
    }).map(tag => tag.title),

    addMemberType = doclet => {
        if (!doclet.type) {
            // type: { names: [ 'String' ] }
            let codeType = doclet.meta.code.type,
                type;
            if (codeType === "Literal") {
                type = tools.capitalize(typeof doclet.meta.code.value);
            } else if (codeType === "ArrayExpression") {
                type = "Array";
            } else if (codeType === "ObjectExpression") {
                type = "Object";
            }
            doclet.type = {names: [type || "Unknown"]};
        }
    },

    checkAccess = doclet => {
        if (!doclet.access) {
            if (doclet.name.startsWith("_")) {
                doclet.access = "private";
            } else {
                doclet.access = "public";
            }
        }
    },

    enumType = {names: ["enum"]},

    cleanEnum = doclet => {
        // Remove default value from documentation and update type
        doclet.type = enumType;
        doclet.properties.forEach(property => {
            delete property.defaultvalue;
            property.type = enumType;
        });
    },

    implementsTitle = "<h4>Implemented in:</h4><ul>",

    checkImplements = (doclet, doclets) => {
        if (!doclet.implements || doclet.access === "private") {
            return;
        }
        trace(`\t@implements: ${doclet.implements.join(",")}`);
        doclet.implements.forEach(interfaceName => {
            const interfaceDoclet = findDoclet(doclets, interfaceName, "@implements");
            if (!interfaceDoclet._implementedIn) {
                interfaceDoclet._description = interfaceDoclet.description;
                interfaceDoclet._implementedIn = [];
            }
            interfaceDoclet._implementedIn.push(doclet.longname);
            interfaceDoclet.description = interfaceDoclet._description
                + implementsTitle
                + interfaceDoclet._implementedIn
                    .sort()
                    .map(longname => `<li>{@link ${longname}}</li>`)
                    .join("")
                + "</ul>";
        });
    },

    kinds = {

        member: doclet => {
            addMemberType(doclet);
            checkAccess(doclet);
        },

        "function": checkAccess,
        "typedef": checkAccess,

        "class": (doclet, doclets) => {
            checkAccess(doclet);
            checkImplements(doclet, doclets);
        }

    },

    postProcessDoclet = (doclet, index, doclets) => {
        let kindHandling = kinds[doclet.kind],
            handledTags = handleGpfTags(doclet, doclets);
        if (kindHandling) {
            kindHandling(doclet, doclets);
        }
        if (doclet.isEnum) {
            cleanEnum(doclet);
        }
        logDoclet(doclet);
        if (handledTags.length) {
            trace(`\t@${handledTags.join(", @")}`);
        }
    },

    reErrorDeclare = /_gpfErrorDeclare\("([^"]+)", {\n((?:[^}]|}[^)]|\n)*)\s*}\)/g,
    reErrorItems = /(?:\/\*\*((?:[^*]|\s|\*[^/])*)\*\/)?\s*([a-zA-Z$0-9]+):\s*"([^"]*)"/g,
    errorParam = " * @param {Object} context Dictionary of parameters used to format the message, must contain",

    generateJsDocForError = (name, message, comment) => {
        let className = tools.capitalize(name),
            params = [];
        message.replace(/{(\w+)}/g, (match, parameterName) => params.push(` * - {String} ${parameterName}`));
        if (params.length) {
            params.unshift(errorParam);
            params = params.join("\r\n");
        } else {
            params = undefined;
        }
        return [
            JSDOC_COMMENT,
            ` * throw {@link gpf.Error.${className}}`,
            ` * @method gpf.Error.${name}`,
            ` * @throws {gpf.Error.${className}}`,
            params,
            " */",
            JSDOC_COMMENT,
            comment,
            ` * @class gpf.Error.${className}`,
            params,
            ` * @see gpf.Error.${name}`,
            " */"
        ].join("\r\n");
    },

    checkForGpfErrorDeclare = event => {
        reErrorDeclare.lastIndex = START;
        const
            MATCH_ERRORS_PART = 2,
            MATCH_ERRORITEM_NAME = 2,
            MATCH_ERRORITEM_MESSAGE = 3,
            MATCH_ERRORITEM_COMMENT = 1,
            match = reErrorDeclare.exec(event.source);
        if (match) {
            let errorsPart = match[MATCH_ERRORS_PART],
                errorItem,
                comments = [];
            reErrorItems.lastIndex = START;
            errorItem = reErrorItems.exec(errorsPart);
            while (errorItem) {
                trace(`error: ${errorItem[MATCH_ERRORITEM_NAME]}`);
                comments.push(generateJsDocForError(errorItem[MATCH_ERRORITEM_NAME], errorItem[MATCH_ERRORITEM_MESSAGE],
                    errorItem[MATCH_ERRORITEM_COMMENT]));
                errorItem = reErrorItems.exec(errorsPart);
            }
            event.source += comments.join("\r\n");
        }
    },

    checkForGpfDefine = event => {
        event.source = event.source.replace(/_gpfDefine\([^$]*\$class:\s*"([a-zA-Z.]+)"/g, (match, className) =>
            match.replace("_gpfDefine(", `_gpfDefine(${JSDOC_COMMENT} @lends ${className}.prototype */`)
        );
    },

    checkForPrototypeAssign = event => {
        event.source = event.source.replace(/Object\.assign\((\w+)\.prototype,[^{]+{/g, (match, className) => {
            if (match.includes("@lends")) {
                return match;
            }
            return match.replace("{", `${JSDOC_COMMENT} @lends ${className}.prototype */ {`);
        });
    },

    reFileComment = /(?:\/\*\*(?:[^*]|\s\*[^/])*@file(?:[^*]|\s\*[^/])*\*\/)/g,

    disableFileComment = event => {
        reFileComment.lastIndex = START;
        let match = reFileComment.exec(event.source),
            fileComment;
        if (match) {
            fileComment = match[START];
            event.source = event.source.replace(fileComment, `/* ${fileComment.substring(JSDOC_COMMENT.length)}`);
        }
    },

    isInsideGpfErrorDeclare = node => {
        let ancestor;
        try {
            ancestor = node.parent.parent.parent;
        } catch (e) {
            return false;
        }
        return ancestor
            && ancestor.type === "ExpressionStatement"
            && ancestor.expression.type === "CallExpression"
            && ancestor.expression.callee.name === "_gpfErrorDeclare"
            && node.type === "Property";
    },

    visitNode = (node, e/*, parser, currentSourceName*/) => { //eslint-disable-line max-params
        if (isInsideGpfErrorDeclare(node)) {
            // This documentation is handled through beforeParse
            e.preventDefault = true;
        }
    };

trace("loaded");

// https://jsdoc.app/about-plugins.html
module.exports = {

    astNodeVisitor: {

        visitNode: visitNode

    },

    handlers: {

        beforeParse: event => {
            trace(`>> beforeParse(${relativeFilename(event.filename)})`);
            disableFileComment(event);
            checkForGpfErrorDeclare(event);
            checkForGpfDefine(event);
            checkForPrototypeAssign(event);
            trace(`<< beforeParse(${relativeFilename(event.filename)})`);
        },

        processingComplete: event => {
            trace(">> processingComplete");
            event.doclets.forEach(postProcessDoclet);
            trace("<< processingComplete");
        }

    }

};
