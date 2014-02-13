(function () { /* Begin of privacy scope */
    "use strict";
    /*global esprima, escodegen*/

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
            // Then, locate the use of __gpf__ to replace it with our content
            // Use an XPATH like parser on body[@type='ExpressionStatement'
            // and expression/@name='__gpf__']
        }

//        console.log(JSON.stringify(sources.parsed.UMD, true, 4));
        console.log(escodegen.generate(sources.parsed.UMD, {
            comment: true
        }));
        gpf.interfaces.ignoreParameter(version);
    };

}()); /* End of privacy scope */
