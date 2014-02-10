(function () { /* Begin of privacy scope */
    "use strict";

    gpf.context().make = function(sources, version) {
        if (!sources.parsed) {
            // First, parse everything
            var
                idx,
                source;
            sources.parsed = {};
            for (idx = 0; idx < sources._list.length; ++idx) {
                source = sources._list[idx];
                sources.parsed[source] = esprima.parse(sources[source], {
                    loc: true,
                    range: true,
                    raw: true,
                    comment: true
                });
            }
            sources.parsed.UMD = esprima.parse(sources.UMD, {
                loc: true,
                range: true,
                raw: true,
                comment: true
            });
        }

//        console.log(JSON.stringify(sources.parsed.UMD, true, 4));
        console.log(escodegen.generate(sources.parsed.UMD, {
            comment: true
        }));
    }

}()); /* End of privacy scope */
