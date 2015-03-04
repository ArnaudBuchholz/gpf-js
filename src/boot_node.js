/*jshint node: true*/
/*global gpfSourcesPath*/ // Global source path
/*global _gpfNodeFS*/ // Node FS module
/*global _gpfFinishLoading*/ // Ends the loading (declared in boot.js)
(function () {
    "use strict";

    // Get sources
    /*jslint evil: true*/
    eval(_gpfNodeFS.readFileSync(gpfSourcesPath + "sources.js").toString());
    /*jslint evil: false*/

    var
        sources = gpf.sources().split(","),
        length = sources.length,
        idx,
        src,
        concat = [];

    // Enumerate all sources and concatenate them
    for (idx = 0; idx < length; ++idx) {
        src = sources[idx];
        if (!src) {
            break;
        }
        src = gpfSourcesPath + src + ".js";
        concat.push(_gpfNodeFS.readFileSync(src).toString());
    }

    /*jslint evil: true*/
    eval(concat.join("\n"));
    /*jslint evil: false*/

    // Trigger finish loading
    _gpfFinishLoading();

}());
