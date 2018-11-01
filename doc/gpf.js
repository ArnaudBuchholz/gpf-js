"use strict";

const
    path = require("path"),
    trace = text => console.log(`[gpf doc plugin] ${text}`),

    relativeFilename = filename => filename.split(`gpf-js${path.sep}src${path.sep}`)[1],
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
            refLongname = doclet.longname.split("#")[0] + "#" + refLongname;
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
            let refDoclet = findRefDoclet(doclets, doclet, tag);
            doclet.returns = [{
                type: refDoclet.type,
                description: refDoclet.description
            }];
            doclet.description = "<i>GET accessor for</i> " + refDoclet.description;
        },

        // Write accessor on a property
        "gpf:write": function (/*doclet, tag, doclets*/) {
            // var refDoclet = findRefDoclet(doclets, doclet, tag);
        },

        // Same as another doclet
        "gpf:sameas": (doclet, tag, doclets) => {
            let refDoclet = findRefDoclet(doclets, doclet, tag);
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
                if (propertyName !== "description" || !doclet.hasOwnProperty(propertyName)) {
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
                type = typeof doclet.meta.code.value;
                type = type.charAt(0).toUpperCase() + type.substr(1);
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
            doclet.access = doclet.name.charAt(0) === "_" ? "private" : "public";
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
    reErrorItems = /(?:\/\*\*((?:[^*]|\s|\*[^/])*)\*\/)?\s*([a-zA-Z$]+):\s*"([^"]*)"/g,
    reContextualParams = /{(\w+)}/g,
    errorParam = " * @param {Object} context Dictionary of parameters used to format the message, must contain",

    generateJsDocForError = (name, message, comment) => {
        let className = name.charAt(0).toUpperCase() + name.substr(1),
            params = [],
            param;
        reContextualParams.lastIndex = 0;
        param = reContextualParams.exec(message);
        while (param) {
            params.push(" * - {String} " + param[1]);
            param = reContextualParams.exec(message);
        }
        if (params.length) {
            params.unshift(errorParam);
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
    },

    checkForGpfErrorDeclare = event => {
        reErrorDeclare.lastIndex = 0;
        const match = reErrorDeclare.exec(event.source);
        if (match) {
            let // moduleName = match[1],
                errorsPart = match[2],
                errorItem,
                comments = [];
            reErrorItems.lastIndex = 0;
            errorItem = reErrorItems.exec(errorsPart);
            while (errorItem) {
                trace(`error: ${errorItem[2]}`);
                comments.push(generateJsDocForError(errorItem[2], errorItem[3], errorItem[1]));
                errorItem = reErrorItems.exec(errorsPart);
            }
            event.source += comments.join("\r\n");
        }
    },

    reGpfDefine = /_gpfDefine\([^$]*\$class:\s*"([a-zA-Z.]+)"/g,

    checkForGpfDefine = event => {
        reGpfDefine.lastIndex = 0;
        let match = reGpfDefine.exec(event.source);
        while (match) {
            event.source = event.source.replace(match[0],
                match[0].replace("_gpfDefine(", `_gpfDefine(/** @lends ${match[1]}.prototype */`));
            match = reGpfDefine.exec(event.source);
        }
    },

    rePrototypeAssign = /Object\.assign\((\w+)\.prototype,[^{]+{/g,

    checkForPrototypeAssign = event => {
        rePrototypeAssign.lastIndex = 0;
        let match = rePrototypeAssign.exec(event.source);
        while (match) {
            if (match[0].indexOf("@lends") === -1) {
                // No @lends, adds it
                event.source = event.source.replace(match[0],
                    match[0].replace("{", `/** @lends ${match[1]}.prototype */ {`));
            }
            match = rePrototypeAssign.exec(event.source);
        }
    },

    reFileComment = /(?:\/\*\*(?:[^*]|\s\*[^/])*@file(?:[^*]|\s\*[^/])*\*\/)/g,

    disableFileComment = event => {
        reFileComment.lastIndex = 0;
        let match = reFileComment.exec(event.source),
            fileComment;
        if (match) {
            fileComment = match[0];
            event.source = event.source.replace(fileComment, `/* ${fileComment.substr(2)}`);
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

// http://usejsdoc.org/about-plugins.html
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
            trace(`>> beforeParse(${relativeFilename(event.filename)})`);
        },

        processingComplete: event => {
            trace(">> processingComplete");
            event.doclets.forEach(postProcessDoclet);
            trace("<< processingComplete");
        }

    }

};
