/*jshint node: true*/
/*global require, __dirname*/
/*global _gpfFinishLoading*/ // Ends the loading (declared in boot.js)
/*global _gpfNodeFS*/ // Node FS module
(function () {
    "use strict";

    require("./sources.js"); // Get sources
    var
        sources = gpf.sources().split(","),
        idx,
        src,
        concat = [];
    for (idx = 0; idx < sources.length; ++idx) {
        src = sources[idx] + ".js";
        concat.push(_gpfNodeFS.readFileSync(__dirname + "/" + src).toString());
    }
    /*jslint evil: true*/
    eval(concat.join("\n"));
    /*jslint evil: false*/

    _gpfFinishLoading();

}());
