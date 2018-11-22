gpf.require.define({
    flavor: "../../make/flavor.js",
    SourceArray: "array.js",
    dependencies: "../../build/dependencies.json"

}, function (require) {
    "use strict";

    var SKIP_QUESTION_MARK = 1,
        allowed,
        sources;

    if (location.search) {
        sources = new require.SourceArray();
        allowed = require.flavor(JSON.parse(sources.toString()), require.dependencies,
            decodeURI(location.search.substring(SKIP_QUESTION_MARK)));
    }

    return allowed;

});
