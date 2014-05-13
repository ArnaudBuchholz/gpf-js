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
                keepComments: false,
                reduce: true,
                rewriteOptions: {
                    format: {
                        indent: {
                            style: "",
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
        xpathToGpfPlaceHolder = new gpfX.XPath({
            type: gpfX.NODE_ELEMENT,
            name: "body",
            relative: false,
            then: {
                type: gpfX.NODE_ELEMENT,
                name: "item",
                filter: {
                    and: [ {
                        type: gpfX.NODE_ATTRIBUTE,
                        name: "type",
                        text: "ExpressionStatement"
                    }, {
                        type: gpfX.NODE_ELEMENT,
                        name: "expression",
                        then: {
                            type: gpfX.NODE_ATTRIBUTE,
                            name: "name",
                            text: "__gpf__"
                        }
                    }]
                }
            }
        })
    ;

    //region Preprocessor (#ifdef)

    function preProcess(src, version) {
        var
            lines = src.split("\n"),
            len = lines.length,
            idx,
            line,
            ignoreStack = [false],
            ignore;
        for (idx = 0; idx < len; ++idx) {
            line = lines[idx];
            ignore = ignoreStack[ignoreStack.length - 1];
            if (-1 < line.indexOf("/*#if")) {
// console.log("#" + line);
                // In the end, we use an "ignore" flag
                // so we invert the condition
                ignore = -1 === line.indexOf("/*#ifndef(");
                line = line.split("(")[1].split(")")[0];
// console.log("\t" + line);
                ignore = gpf.xor(version[line], ignore);
// console.log("\t" + ignore);
                ignoreStack.push(ignore);
                ignore = true; // Ignore this line
// console.log(">>" + ignoreStack);
                /*
                 * TODO handle imbricated when the parent is false
                 */

            } else if (-1 < line.indexOf("/*#else")) {
                ignoreStack[ignoreStack.length - 1] = !ignore;
                ignore = true; // Ignore this line

            } else if (-1 < line.indexOf("/*#endif")) {
// console.log("#" + line);
                ignoreStack.pop();
                ignore = true; // Ignore this line
// console.log(">>" + ignoreStack);
            }
// console.log((ignore ? "-" : "+")  + line);
            if (ignore) {
                lines.splice(idx, 1);
                --len;
                --idx;
            }
        }
        return lines.join("\n");
    }

    //endregion

    function toAST(src, version) {
        // https://github.com/Constellation/escodegen/issues/85
        var
            keepComments = version.keepComments,
            ast = esprima.parse(src, {
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
    }

    //region AST compactor

    /**
     * AST Reducer
     *
     * @class ASTreducer
     * @private
     */
    var ASTreducer = gpf.define("ASTreducer", {

        public: {

            constructor: function() {

                this._identifiers = {};
                this._identifiersStack = [];

            },

            /**
             * Process the AST to reduce the generated source
             *
             * @param {Object} ast
             */
            reduce: function (ast) {
                this._walk(ast);
            },

            //region AST processing APIs

            beginIdentifierMapping: function (names, forVariables) {
                var
                    len = names.length,
                    idx,
                    name;
                if (forVariables) {
                    names.isVariables = true;
                }
                this._identifiersStack.push(names);
                for (idx = 0; idx < len; ++idx) {
                    name = names[idx];
                    this._identifiers[name] = "_" + (this._identifierCount++);
                }
            },

            endIdentifierMapping: function () {
                var
                    names,
                    len,
                    idx,
                    name;
                do {
                    names = this._identifiersStack.pop();
                    len = names.length;
                    for (idx = 0; idx < len; ++idx) {
                        name = names[idx];
                        delete this._identifiers[name];
                    }
                    this._identifierCount -= names.length;
                } while (names.isVariables);
            },

            isIdentifierMapped: function (name) {
                var
                    newName = this._identifiers[name];
                if (undefined !== newName
                    && this._identifiers.hasOwnProperty(name)) {
                    return newName;
                }
                return undefined;
            }

            //endregion

        },

        private: {

            _identifiers: {},
            _identifiersStack: [],
            _identifierCount: 0,

            _walk: function (ast) {
                var
                    myStatics = this.constructor,
                    member,
                    subItem,
                    processor;
                if (ast instanceof Array) {
                    for (member = 0; member < ast.length; ++member) {
                        this._walk(ast[member]);
                    }
                } else {
                    if (ast.type) {
                        processor = myStatics[ast.type];
                    }
                    if (undefined !== processor && processor.pre) {
                        processor.pre(ast, this);
                    }
                    for (member in ast) {
                        if (ast.hasOwnProperty(member)) {
                            subItem = ast[member];
                            if ("object" === typeof subItem && subItem) {
                                this._walk(subItem);
                            }
                        }
                    }
                    if (undefined !== processor && processor.post) {
                        processor.post(ast, this);
                    }
                }
            }

        },

        static: {

            VariableDeclaration: {

                pre: function (ast, reducer) {
                    var
                        names = [],
                        len = ast.declarations.length,
                        idx;
                    for (idx = 0; idx < len; ++idx) {
                        names.push(ast.declarations[idx].id.name);
                    }
                    reducer.beginIdentifierMapping(names, true);
                }

            },

            FunctionExpression: {

                pre: function (ast, reducer) {
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
                    gpf.interfaces.ignoreParameter(ast);
                    // Clean parameters (and inner variables) substitutions
                    reducer.endIdentifierMapping();
                }
            },

            Identifier: {

                pre: function (astItem, reducer) {
                    var newName = reducer.isIdentifierMapped(astItem.name);
                    if (undefined !== newName) {
                        astItem.name = newName;
                    }
                }

            }

        }

    });

    //endregion

    function pushCloneOf(idx, item) {
        /*jslint -W040*/
        gpf.interfaces.ignoreParameter(idx);
        this.push(gpf.clone(item));
        /*jslint +W040*/
    }

    gpf.context().make = function(sources, version) {
        var
            parsed,
            __gpf__,
            placeholder,
            idx,
            source,
            body,
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
        parsed.UMD = toAST(parsed["UMD.js"], version);
        parsed.result = gpf.clone(parsed.UMD);
        parsed["boot.js"] = preProcess(sources.boot, version);
        parsed.boot = toAST(parsed["boot.js"], version);
        for (idx = 0; idx < sources._list.length; ++idx) {
            source = sources._list[idx];
            parsed[source + ".js"] = preProcess(sources[source], version);
            parsed[source] = toAST(parsed[source + ".js"], version);
        }
        // Then, locate the use of __gpf__ to replace it with our content
        __gpf__ = xpathToGpfPlaceHolder
            .selectNodes(new gpfX.ConstNode(parsed.result))[0];
        // Parent is the placeholder (an array ending with __gpf__)
        placeholder = __gpf__.parentNode().nodeValue();
        placeholder.pop(); // remove __gpf__
        // Add all sources
        for (idx = -1; idx < sources._list.length; ++idx) {
            if (-1 === idx) {
                source = "boot";
            } else {
                source = sources._list[idx];
            }
            try {
                body = parsed[source].body;
            } catch(e) {
                console.error("Error while processing source: " + source
                    + "\r\n" + e.message);
            }
            if (version.reduce) {
                if (null === reducer) {
                    reducer = new ASTreducer();
                }
                reducer.reduce(body);
                parsed[source + ".compact.js"] =
                    escodegen.generate(body, versions.debug.rewriteOptions);
            }
            if (body instanceof Array) {
// console.log("Adding " + body.length + " items from " + source);
                gpf.each.apply(placeholder, [body, pushCloneOf]);
            } else {
// console.log("Adding item from " + source + "\r\n" + body.item);
                placeholder.push(gpf.clone(body));
            }
        }
        // And generate the result
        parsed["result.js"] = escodegen.generate(parsed.result,
            version.rewriteOptions);

        return parsed["result.js"];
    };

}()); /* End of privacy scope */
