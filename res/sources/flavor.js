gpf.require.define({
    flavor: "../../make/flavor.js",
    SourceArray: "array.js",
    dependencies: "../../build/dependencies.json"

}, function (require) {
    "use strict";

    var allowed,
        sources;

    if (location.search) {
        sources = new require.SourceArray();
        allowed = require.flavor(JSON.parse(sources.toString()), require.dependencies,
            decodeURI(location.search.substr(1)));
    }

    return allowed;

});
