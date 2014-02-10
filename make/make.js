(function () { /* Begin of privacy scope */
    "use strict";

    function toAST(src) {
        // https://github.com/Constellation/escodegen/issues/85
        var ast = esprima.parse(src, {
            range: true,
            tokens: true,
            comment: true
        });
        return escodegen.attachComments(ast, ast.comments, ast.tokens);
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
            
        }

//        console.log(JSON.stringify(sources.parsed.UMD, true, 4));
        console.log(escodegen.generate(sources.parsed.UMD, {
            comment: true
        }));
    }

}()); /* End of privacy scope */
