/*jshint browser: true*/
/*global _gpfContext*/ // Resolve contextual string
/*global _gpfFinishLoading*/ // Ends the loading (declared in boot.js)
/*global _gpfWebRawInclude*/ // Raw web include
/*global gpfSourcesPath*/ // Global source path
(function () {
    "use strict";

    var
        sources,
        length,
        idx = 0,

        /**
         * Iterate on remaining sources using idx as the current index in the
         * sources array and include them using gpf.http.include.
         * The function is also the callback to handle the loaded event.
         *
         * @param {gpf.events.Event} event (unused)
         */
        loadSources = function (/*event*/) {
            var src;
            if (idx < length) {
                src = sources[idx];
            }
            if (src) {
                gpf.web.include(gpfSourcesPath + src + ".js", loadSources);
                ++idx;
            } else {
                // Trigger finish loading
                _gpfFinishLoading();
            }
        },

        /**
         * Sequence of things to load (followed by the gpf member to test)
         *
         * @type {string[]}
         */
        bootList = [
            "sources",          "gpf.sources",
            "compatibility",    "gpf.setReadOnlyProperty",
            "constants",        "gpf.HOST_UNKNOWN",
            "events",           "gpf.events",
            "include",          "gpf.web.include"
        ],

        /**
         * Load a predefined static list of files and test if they are
         * loaded before moving to the next one.
         */
        boot = function () {
            if (0 === idx % 2) {
                _gpfWebRawInclude(bootList[idx] + ".js");
                ++idx;
            } else if (undefined !== _gpfContext(bootList[idx].split("."))) {
                ++idx;
            }
            if (idx === bootList.length) {
                /*
                 * Now that all initial sources are loaded,
                 * load the rest using gpf.web.include
                 */
                sources = gpf.sources().split(",");
                length = sources.length;
                idx = sources.indexOf(bootList[bootList.length - 2]) + 1;
                loadSources();

            } else {
                /**
                 * Use an aggressive setting as it will be used only for
                 * the non UMD version
                 */
                setTimeout(boot, 0);
            }
        };

    boot();

}());