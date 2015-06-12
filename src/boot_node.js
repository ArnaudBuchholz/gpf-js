/*jshint node: true*/
/*global _gpfFinishLoading*/ // Ends the loading (declared in boot.js)
/*global _gpfFSRead*/ // Phantom/Node File System read text file method (boot)
/*global gpfSourcesPath*/ // Global source path
(function () {
    "use strict";

    // Get sources
    /*jslint evil: true*/
    eval(_gpfFSRead(gpfSourcesPath + "sources.js"));
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
        concat.push(_gpfFSRead(src));
    }

    /*jslint evil: true*/
    eval(concat.join("\n"));
    /*jslint evil: false*/

    // Trigger finish loading
    _gpfFinishLoading();

}());
