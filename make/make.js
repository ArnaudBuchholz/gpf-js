(function () { /* Begin of privacy scope */
    "use strict";
    /*global esprima, escodegen*/

    var
        gpfX = gpf.xml,
        versions = {
            debug: {
                UMD: true,
                DEBUG: true,
                keepComments: true,
                reduce: false,
                // escodegen options
                rewriteOptions: {
                    format: {
                        indent: {
                            style: "    ",
                            base: 0,
                            adjustMultilineComment: false
                        },
                        newline: "\n",
                        space: " ",
                        json: false,
                        renumber: false,
                        hexadecimal: false,
                        quotes: "double",
                        escapeless: false,
                        reduce: false,
                        parentheses: true,
                        semicolons: true,
                        safeConcatenation: false
                    },
                    comment: true
                }
            },
            release: {
                UMD: true,
                DEBUG: false,
                keepComments: true, // Needed for gpf: tags
                reduce: true,
                // escodegen options
                rewriteOptions: {
                    format: {
                        indent: {
                            style: "",
                            base: 0,
                            adjustMultilineComment: false
                        },
                        newline: "",
                        space: "",
                        json: false,
                        renumber: false,
                        hexadecimal: false,
                        quotes: "double",
                        escapeless: false,
                        reduce: true,
                        parentheses: false,
                        semicolons: true,
                        safeConcatenation: true
                    },
                    comment: false
                }
            }
        },
        // body/item[@type="ExpressionStatement" and expression/@name="__gpf__"]
        //xpathToGpfPlaceHolder = new gpfX.XPath({
        //    type: gpfX.NODE_ELEMENT,
        //    name: "body",
        //    relative: false,
        //    then: {
        //        type: gpfX.NODE_ELEMENT,
        //        name: "item",
        //        filter: {
        //            and: [ {
        //                type: gpfX.NODE_ATTRIBUTE,
        //                name: "type",
        //                text: "ExpressionStatement"
        //            }, {
        //                type: gpfX.NODE_ELEMENT,
        //                name: "expression",
        //                then: {
        //                    type: gpfX.NODE_ATTRIBUTE,
        //                    name: "name",
        //                    text: "__gpf__"
        //                }
        //            }]
        //        }
        //    }
        //}),
        identifierCharacters = "abcdefghijklmnopqrstuvwxyz"
                             + "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    ;

    //region Preprocessor (#ifdef)

    /**
     * Preprocess the JavaScript source and process the #ifdef macros
     *
     * @param {String} src
     * @param {Object} version Contains constants definition (see above)
     * @return {String}
     */
    function preProcess(src, version) {
        var
            lines = src.split("\n"),
            len = lines.length,
            idx,
            line,
            macro,
            invert,
            ignoreStack = [false],
            ignoreTop,
            ignore;
        // Process each line individually
        for (idx = 0; idx < len; ++idx) {
            line = lines[idx];
            // Current ignore state
            ignoreTop = ignoreStack.length - 1;
            ignore = ignoreStack[ignoreTop];
            if (-1 < line.indexOf("/*#if")) {
                invert = -1 === line.indexOf("/*#ifndef(");
                macro = line.split("(")[1].split(")")[0];
                ignore = gpf.xor(version[macro], invert);
                ignoreStack.push(ignore);
                ignore = true; // Ignore this line

            } else if (-1 < line.indexOf("/*#else")) {
                // Also handles imbricated #if/#endif
                if (ignoreTop === 0 || !ignoreStack[ignoreTop - 1]) {
                    ignoreStack[ignoreTop] = !ignore;
                }
                ignore = true; // Ignore this line

            } else if (-1 < line.indexOf("/*#endif")) {
                ignoreStack.pop();
                ignore = true; // Ignore this line
            }
            if (ignore) {
                lines.splice(idx, 1);
                --len;
                --idx;
            }
        }
        return lines.join("\n");
    }

    //endregion

    /**
     * Convert the source into the AST equivalent
     *
     * @param {Object} parsed Dictionary of all sources
     * @param {String} src File name
     * @param {Object} version Options to use
     * @return {*}
     */
    function toAST(parsed, src, version) {
        // https://github.com/Constellation/escodegen/issues/85
        try {
            var
                keepComments = version.keepComments,
                ast = esprima.parse(parsed[src], {
                    range: keepComments,
                    tokens: keepComments,
                    comment: keepComments
                });
            if (keepComments) {
                ast = escodegen.attachComments(ast, ast.comments, ast.tokens);
                delete ast.tokens;
                delete ast.comments;
            }
            return ast;
        } catch(e) {
            console.error("Error in \"" + src + "\": " + e.message);
            throw e;
        }
    }

    //region AST compactor

    /**
     * AST Reducer
     *
     * @class ASTreducer
     * @private
     */
    var ASTreducer = function() {
        this._identifiers = {};
        this._identifiersStack = [];
    };

    ASTreducer.prototype = {

        /**
         * Process the AST to reduce the generated source
         *
         * @param {Object} ast
         */
        reduce: function (ast) {
            this._walk(ast);
        },

        //region AST processing APIs

        /**
         * Create new variable names for the provided name list.
         *
         * @param {String[]} names
         * @param {Boolean} forVariables
         */
        beginIdentifierMapping: function (names, forVariables) {
            //if (START_TRACES) {
            //    console.log(">> beginIdentifierMapping");
            //    if (forVariables) {
            //        console.log("\t+[VAR] " + names.join(","));
            //    } else {
            //        console.log("\t+[FUN] " + names.join(","));
            //    }
            //    for (idx = this._identifiersStack.length - 1;
            //         idx > 0; --idx) {
            //        var stackedNames = this._identifiersStack[idx];
            //        if (stackedNames.isVariables) {
            //            console.log("\t[VAR] " + stackedNames.join(","));
            //        } else {
            //            console.log("\t[FUN] " + stackedNames.join(","));
            //        }
            //    }
            //}
            var
                len = names.length,
                idx,
                name,
                newNames;
            if (forVariables) {
                names.isVariables = true;
            }
            names.identifierCount = this._identifierCount;
            this._identifiersStack.push(names);
            for (idx = 0; idx < len; ++idx) {
                name = " " + names[idx];
                newNames = this._identifiers[name];
                if (undefined === newNames) {
                    newNames = this._identifiers[name] = [];
                }
                newNames.unshift(this._newName());
                //if (name === "gpf") {
                //    console.log("!!! gpf = " + this._identifiers[name]);
                //    START_TRACES = 5;
                //}
            }
        },

        /**
         * Roll back new variable names created with beginIdentifierMapping
         */
        endIdentifierMapping: function () {
            //if (START_TRACES) {
            //    console.log(">> endIdentifierMapping");
            //    for (idx = this._identifiersStack.length - 1;
            //         idx > 0; --idx) {
            //        names = this._identifiersStack[idx];
            //        if (names.isVariables) {
            //            console.log("\t[VAR] " + names.join(","));
            //        } else {
            //            console.log("\t[FUN] " + names.join(","));
            //        }
            //    }
            //}
            /*
             * Undo identifiers stack until a non 'isVariables' one is found
             */
            var
                stack = this._identifiersStack,
                names,
                len,
                idx,
                name,
                newNames;
            do {
                names = stack.pop();
                len = names.length;
                for (idx = 0; idx < len; ++idx) {
                    name = " " + names[idx];
                    newNames = this._identifiers[name];
                    if (newNames.length === 1) {
                        delete this._identifiers[name];
                    } else {
                        newNames.shift();
                    }
                }
                this._identifierCount = names.identifierCount;
            } while (names.isVariables);
            //if (START_TRACES) {
            //    console.log("<< endIdentifierMapping");
            //    for (idx = this._identifiersStack.length - 1;
            //         idx > 0; --idx) {
            //        names = this._identifiersStack[idx];
            //        if (names.isVariables) {
            //            console.log("\t[VAR] " + names.join(","));
            //        } else {
            //            console.log("\t[FUN] " + names.join(","));
            //        }
            //    }
            //    START_TRACES--;
            //}
        },

        /**
         * Return the nmapped identifier (if any)
         *
         * @param {String} name
         * @returns {String|undefined}
         */
        isIdentifierMapped: function (name) {
            name = " " + name;
            if (this._identifiers.hasOwnProperty(name)) {
                return this._identifiers[name][0];
            }
            return undefined;
        },

        //endregion

        //region members

        /**
         * Stack of name arrays (corresponding to the cumulated calls to
         * beginIdentifierMapping)
         *
         * @type {String[][]}
         * @private
         */
        _identifiersStack: [],

        /**
         * Number of identifiers mapped
         *
         * @type {Number}
         * @private
         */
        _identifierCount: 0,

        /**
         * Dictionary of name to mapped identifiers (Array)
         * NOTE key is escaped to avoid collision with existing members.
         *
         * @type {Object}
         * @private
         */
        _identifiers: {},

        //endregion

        //region Internal methods

        /**
         * Explore the AST array and apply the necessary transformations
         *
         * @param {Array} astArray
         * @private
         */
        _walkArray: function (astArray) {
            var
                idx,
                subItem,
                names;
            // First pass to see if any FunctionDeclaration names
            for (idx = 0; idx < astArray.length; ++idx) {
                subItem = astArray[idx];
                if (subItem.type === "FunctionDeclaration") {
                    if (undefined === names) {
                        names = [];
                    }
                    names.push(subItem.id.name);
                }
            }
            if (undefined !== names) {
                this.beginIdentifierMapping(names, true);
            }
            // Second pass to reduce
            for (idx = 0; idx < astArray.length; ++idx) {
                this._walk(astArray[idx]);
            }
        },

        /**
         * Explore the AST structure and apply the necessary transformations
         * The transformations are based on processors declared as static
         * members of this class.
         * Each processor is matched using the AST type and it may contain:
         * - pre: function to apply before exploring the AST
         * - post: function to apply after exploring the AST
         * - walk: override the AST exploring
         *
         * @param {Object} ast
         * @private
         */
        _walk: function (ast) {
            var
                myStatics = this.constructor,
                member,
                subItem,
                processor;
            if (ast instanceof Array) {
                this._walkArray(ast);
            } else {
                if (ast.type) {
                    processor = myStatics[ast.type];
                }
                if (undefined !== processor && processor.pre) {
                    processor.pre(ast, this);
                }
                if (undefined !== processor && processor.walk) {
                    processor.walk(ast, this);
                } else {
                    for (member in ast) {
                        if (ast.hasOwnProperty(member)) {
                            subItem = ast[member];
                            if ("object" === typeof subItem && subItem) {
                                this._walk(subItem);
                            }
                        }
                    }
                }
                if (undefined !== processor && processor.post) {
                    processor.post(ast, this);
                }
            }
        },

        /**
         * New name allocator (based on number of identifiers)
         *
         * @returns {String}
         * @private
         */
        _newName: function () {
            var
                id,
                newName,
                mod = identifierCharacters.length;
            do {
                id = this._identifierCount++;
                newName = [];
                while (id >= identifierCharacters.length) {
                    newName.push(identifierCharacters.charAt(id % mod));
                    id = id / mod;
                }
                newName.push(identifierCharacters.charAt(id));
                newName = newName.join("");
            } while (undefined !== gpf.test(gpf.js.keywords(), newName));
            return newName;
        }

        //endregion

    };

    /**
     * Test if the AST item has the request gpf: tag
     *
     * @param {Object} ast
     * @param {String} tag
     * @returns {boolean}
     */
    ASTreducer.isTaggedWith = function (ast, tag) {
        var array,
            len,
            idx;
        if (!ast.leadingComments) {
            return false;
        }
        tag = "gpf:" + tag;
        array = ast.leadingComments;
        len = array.length;
        for (idx = 0; idx < len; ++idx) {
            if (array[idx].value === tag) {
                return true;
            }
        }
        return false;
    };

    ASTreducer.VariableDeclaration = {

        pre: function (ast, reducer) {
            var
                names = [],
                len = ast.declarations.length,
                idx,
                decl;
            for (idx = 0; idx < len; ++idx) {
                decl = ast.declarations[idx];
                if (!ASTreducer.isTaggedWith(decl, "no-reduce")) {
                    names.push(decl.id.name);
                }
            }
            // TODO distinguish 'globals' from inner variables
            reducer.beginIdentifierMapping(names, true);
        }

    };

    ASTreducer.FunctionDeclaration = {

        pre: function (ast, reducer) {
            // Name is reduced at an higher level
            var
                names = [],
                idx,
                len;
            // Process parameters
            if (ast.params && ast.params.length) {
                len = ast.params.length;
                for (idx = 0; idx < len; ++idx) {
                    names.push(ast.params[idx].name);
                }
            }
            reducer.beginIdentifierMapping(names, false);
        },

        post: function (ast, reducer) {
            // Clean parameters (and inner variables) substitutions
            reducer.endIdentifierMapping();
        }

    };

    ASTreducer.FunctionExpression = {

        pre: function (ast, reducer) {
            var
                names = [],
                len,
                idx,
                param;
            // Process parameters
            if (ast.params && ast.params.length) {
                len = ast.params.length;
                for (idx = 0; idx < len; ++idx) {
                    param = ast.params[idx];
                    if (!ASTreducer.isTaggedWith(param, "no-reduce")) {
                        names.push(ast.params[idx].name);
                    }
                }
            }
            reducer.beginIdentifierMapping(names, false);
        },

        post: function (ast, reducer) {
            // Clean parameters (and inner variables) substitutions
            reducer.endIdentifierMapping();
        }

    };

    ASTreducer.Identifier = {

        pre: function (astItem, reducer) {
            // TODO Check the astParent avoid !MemberExpression.property
            var newName = reducer.isIdentifierMapped(astItem.name);
            if (undefined !== newName) {
                astItem.name = newName;
            }
        }

    };

    ASTreducer.MemberExpression = {

        walk: function (astItem, reducer) {
            reducer.reduce(astItem.object);
            // Reduce property only if computed
            if (astItem.computed) {
                reducer.reduce(astItem.property);
            }
        }

    };

    ASTreducer.ObjectExpression = {

        walk: function (astItem, reducer) {
            var len, idx;
            len = astItem.properties.length;
            for (idx = 0; idx < len; ++idx) {
                reducer.reduce(astItem.properties[idx].value);
            }
        }

    };

    //endregion

    function pushCloneOf(idx, item) {
        /*jslint -W040*/
        this.push(gpf.clone(item));
        /*jslint +W040*/
    }

    /**
     * Process a specific source
     *
     * @param {Object} parsed Dictionary of sources
     * @param {String} source Source name
     * @param {Object} version Version to apply
     * @param {Object} placeholder result AST placeholder
     * @param {ASTreducer} reducer
     */
    function process (parsed, source, version, placeholder, reducer) {
        var body;
        try {
            body = parsed[source].body;
        } catch(e) {
            console.error("Error while processing source: " + source
                + "\r\n" + e.message);
        }
        if (version.reduce) {
            reducer.reduce(body);
            try {
                parsed[source + ".compact.js"] =
                    escodegen.generate(parsed[source],
                        versions.debug.rewriteOptions);
            } catch (e) {
                console.error("Failed to generate compact source for "
                    + source + ": " + e.message);
            }
        }
        if (body instanceof Array) {
// console.log("Adding " + body.length + " items from " + source);
            gpf.each.apply(placeholder, [body, pushCloneOf]);
        } else {
// console.log("Adding item from " + source + "\r\n" + body.item);
            placeholder.push(gpf.clone(body));
        }
    }

    /**
     * Merge all sources and apply the requested version definition
     *
     * @param {Object} sources Dictionary of sources
     * @param {String} version version to apply
     * @returns {*}
     */
    gpf.context().make = function (sources, version) {
        var
            parsed,
            __gpf__,
            placeholder,
            idx,
            source,
            reducer = null;
        if (undefined === versions[version]) {
            throw {
                message: "Unknown version"
            };
        }
        parsed = sources[version];
        if (undefined !== parsed) {
            return parsed.gpf;
        }
        parsed = sources[version] = {};
        version = versions[version];
        // First, parse everything
        parsed["UMD.js"] = preProcess(sources.UMD, version);
        parsed.UMD = toAST(parsed, "UMD.js", version);
        if (version.reduce) {
            reducer = new ASTreducer();
            reducer.reduce(parsed.UMD.body);
            try {
                parsed["UMD.compact.js"] =
                    escodegen.generate(parsed.UMD,
                        versions.debug.rewriteOptions);
            } catch (e) {
                console.error("Failed to generate compact source for UMD: "
                    + e.message);
            }
        }
        parsed.result = gpf.clone(parsed.UMD);
        parsed["boot.js"] = preProcess(sources.boot, version);
        parsed.boot = toAST(parsed, "boot.js", version);
        for (idx = 0; idx < sources._list.length; ++idx) {
            source = sources._list[idx];
            parsed[source + ".js"] = preProcess(sources[source], version);
            parsed[source] = toAST(parsed, source + ".js", version);
        }
        // Then, locate the use of __gpf__ to replace it with our content
        //__gpf__ = xpathToGpfPlaceHolder
        //    .selectNodes(new gpfX.ConstNode(parsed.result))[0];
        // Parent is the placeholder (an array ending with __gpf__)
        //placeholder = __gpf__.parentNode().nodeValue();
        placeholder = parsed
            .result
            .body[0]
            .expression
            ["arguments"][1]
            .body.body;
        placeholder.pop(); // remove __gpf__
        // Add all sources
        for (idx = -1; idx < sources._list.length; ++idx) {
            if (-1 === idx) {
                source = "boot";
            } else {
                source = sources._list[idx];
            }
            process(parsed, source, version, placeholder, reducer);
        }
        // And generate the result
        parsed["result.js"] = escodegen.generate(parsed.result,
            version.rewriteOptions);

        return parsed["result.js"];
    };

}()); /* End of privacy scope */