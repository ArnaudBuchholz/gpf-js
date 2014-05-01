(function () { /* Begin of privacy scope */
    "use strict";
    /*global esprima, escodegen*/

    var
        gpfX = gpf.xml,
        versions = {
            debug: {
                UMD: true,
                DEBUG: true,
                keepComments: true
            },
            release: {
                UMD: true,
                DEBUG: false,
                keepComments: false
            }
        },
        // body/item[@type='ExpressionStatement' and expression/@name='__gpf__']
        xpath = new gpfX.XPath({
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
                // In the end, we use an 'ignore' flag
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

    gpf.context().make = function(sources, version) {
        var
            parsed,
            __gpf__,
            placeholder;
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
        parsed.UMD = toAST(preProcess(sources.UMD, version), version);
        parsed.boot = toAST(preProcess(sources.boot, version), version);
        var
            idx,
            source;
        for (idx = 0; idx < sources._list.length; ++idx) {
            source = sources._list[idx];
            parsed[source] = toAST(preProcess(sources[source], version),
                version);
        }
        // Then, locate the use of __gpf__ to replace it with our content
        __gpf__ = xpath.selectNodes(new gpfX.ConstNode(parsed.UMD))[0];
        // Parent is the placeholder (an array ending with __gpf__)
        placeholder = __gpf__.parentNode().nodeValue();
        placeholder.pop(); // remove __gpf__

        console.log(escodegen.generate(parsed.UMD, {
            comment: true
        }));
    };

}()); /* End of privacy scope */
