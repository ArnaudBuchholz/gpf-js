/*jshint wsh: true*/
/*global gpfSourcesPath*/ // Global source path
/*global _gpfFinishLoading*/ // Ends the loading (declared in boot.js)
/*global _gpfMsFSO*/ // Scripting.FileSystemObject activeX
(function () {
    "use strict";

    var
        /**
         * Read the content of the source file
         *
         * @param {String} src
         * @returns {String}
         */
        read = function (src) {
            // gpfSourcesPath - if defined - gives the relative path to sources
            if ("undefined" !== typeof gpfSourcesPath) {
                src = gpfSourcesPath + src;
            }
            // Use Scripting.FileSystem Object to read the file
            var srcFile = _gpfMsFSO.OpenTextFile(src),
                result;
            result = srcFile.ReadAll();
            srcFile.Close();
            return result;
        },
        sources,
        length,
        idx,
        concat = [];

    /*jslint evil: true*/
    eval(read("sources.js")); // Get sources list
    /*jslint evil: false*/

    // Enumerate all sources and concatenate them
    sources = gpf.sources().split(",");
    length = sources.length;
    for (idx = 0; idx < length; ++idx) {
        concat.push(read(sources[idx] + ".js"));
    }

    /*jslint evil: true*/
    eval(concat.join(""));
    /*jslint evil: false*/

    // Trigger finish loading
    _gpfFinishLoading();

}());
