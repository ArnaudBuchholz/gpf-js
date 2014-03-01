(function () { /* Begin of privacy scope */
    "use strict";
    /*global esprima, escodegen*/

    var
        gpfX = gpf.xml;

    function toAST(src) {
        // https://github.com/Constellation/escodegen/issues/85
        var ast = esprima.parse(src, {
            range: true,
            tokens: true,
            comment: true
        });
        ast = escodegen.attachComments(ast, ast.comments, ast.tokens);
        delete ast.tokens;
        delete ast.comments;
        return ast;
    }

    gpf.context().make = function(sources, version) {
        var
            __gpf__,
            xpath,
            placeholder;
        if (!sources.parsed) {
            // First, parse everything
            var
                idx,
                source;
            sources.parsed = {};
            for (idx = 0; idx < sources._list.length; ++idx) {
                source = sources._list[idx];
                sources.parsed[source] = toAST(sources[source]);
            }
            sources.parsed.UMD = toAST(sources.UMD);
            sources.parsed.boot = toAST(sources.boot);
        }
        // Then, locate the use of __gpf__ to replace it with our content
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
        });
        __gpf__ = xpath.selectNodes(new gpfX.ConstNode(sources.parsed.UMD))[0];
        // Parent is the placeholder (an array ending with __gpf__)
        placeholder = __gpf__.parentNode().nodeValue();
        placeholder.pop(); // remove __gpf__


        console.log(escodegen.generate(sources.parsed.UMD, {
            comment: true
        }));
        gpf.interfaces.ignoreParameter(version);
    };

}()); /* End of privacy scope */
