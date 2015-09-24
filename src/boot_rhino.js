/*jshint rhino: true*/
/*global _gpfFinishLoading*/ // Ends the loading (declared in boot.js)
/*global gpfSourcesPath*/ // Global source path
(function () {
    "use strict";

    // Get sources
    load(gpfSourcesPath + "sources.js");

    var
        sources = gpf.sources(),
        length = sources.length,
        idx,
        src;

    // Enumerate all sources and concatenate them
    for (idx = 0; idx < length; ++idx) {
        src = sources[idx];
        if (!src) {
            break;
        }
        load(gpfSourcesPath + src + ".js");
    }

    // Trigger finish loading
    _gpfFinishLoading();

}());
