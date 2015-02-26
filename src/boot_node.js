/*jshint node: true*/
/*global require, __dirname*/
/*global _gpfFinishLoading*/ // Ends the loading (declared in boot.js)
/*global _gpfNodeFS*/ // Node FS module
(function () {
    "use strict";

    require("./sources.js"); // Get sources
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
        src = __dirname + "/" + src + ".js";
        concat.push(_gpfNodeFS.readFileSync(src).toString());
    }

    /*jslint evil: true*/
    eval(concat.join("\n"));
    /*jslint evil: false*/

    // Trigger finish loading
    _gpfFinishLoading();

}());
