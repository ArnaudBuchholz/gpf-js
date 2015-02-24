/*jshint wsh: true*/
/*global gpfSourcesPath*/ // Global source path
/*global _gpfFinishLoading*/ // Ends the loading (declared in boot.js)
/*global _gpfMsFSO*/ // Scripting.FileSystemObject activeX
(function () {
    "use strict";

    var
        read = function (src) {
            if ("undefined" !== typeof gpfSourcesPath) {
                src = gpfSourcesPath + src;
            }
            var srcFile = _gpfMsFSO.OpenTextFile(src),
                result;
            // No other choice to evaluate in the current context
            result = srcFile.ReadAll();
            srcFile.Close();
            return result;
        },
        sources,
        idx,
        concat = [];
    /*jslint evil: true*/
    eval(read("sources.js")); // Get sources list
    /*jslint evil: false*/
    sources = gpf.sources().split(",");
    for (idx = 0; idx < sources.length; ++idx) {
        concat.push(read(sources[idx] + ".js"));
    }
    /*jslint evil: true*/
    eval(concat.join(""));
    /*jslint evil: false*/

    _gpfFinishLoading();

}());
