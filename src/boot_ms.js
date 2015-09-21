/*jshint wsh: true*/
/*global _gpfFinishLoading*/ // Ends the loading (declared in boot.js)
/*global _gpfMsFSO*/ // Scripting.FileSystemObject activeX
/*global gpfSourcesPath*/ // Global source path
(function () {
    "use strict";

    var
        /**
         * Read the content of the source file
         *
         * @param {String} src
         * @return {String}
         */
        read = function (src) {
            // Use Scripting.FileSystem Object to read the file
            var srcFile = _gpfMsFSO.OpenTextFile(gpfSourcesPath + src),
                result;
            result = srcFile.ReadAll();
            srcFile.Close();
            return result;
        },
        sources,
        length,
        idx,
        src;

    /*jslint evil: true*/
    eval(read("sources.js")); // Get sources list
    /*jslint evil: false*/

    // Enumerate all sources and concatenate them
    sources = gpf.sources();
    length = sources.length;
    for (idx = 0; idx < length; ++idx) {
        src = sources[idx];
        if (!src) {
            break;
        }
        try {
            /*jslint evil: true*/
            eval(read(src + ".js"));
            /*jslint evil: false*/
        } catch (e) {
            console.error("An error occurred while evaluating src/" + src + ".js: " + e.message);
            throw e;
        }
    }

    // Trigger finish loading
    _gpfFinishLoading();

}());
