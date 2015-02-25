/*jshint browser: true*/
/*global gpfSourcesPath*/ // Global source path
/*global _gpfRawHttpInclude*/ // Raw HTTP include
/*global _gpfFinishLoading*/ // Ends the loading (declared in boot.js)
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
            if (idx < length) {
                gpf.http.include(gpfSourcesPath + sources[idx] + ".js",
                    loadSources);
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
            "sources",          "sources",
            "compatibility",    "setReadOnlyProperty",
            "constants",        "_constants",
            "base",             "each",
            "like",             "like",
            "callback",         "Callback",
            "events",           "events",
            "http",             "http"
        ],

        /**
         * Load a predefined static list of files and test if they are
         * loaded before moving to the next one.
         */
        boot = function () {
            if (0 === idx % 2) {
                _gpfRawHttpInclude(bootList[idx] + ".js");
                ++idx;
            } else if (undefined !== gpf[bootList[idx]]) {
                ++idx;
            }
            if (idx === bootList.length) {
                /*
                 * Now that all initial sources are loaded,
                 * load the rest using gpf.http.include
                 */
                sources = gpf.sources().split(",");
                length = sources.length;
                idx = gpf.test(sources, "http") + 1;
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