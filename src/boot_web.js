/*jshint browser: true*/
/*global gpfSourcesPath*/ // Global source path
/*global _gpfFinishLoading*/ // Ends the loading (declared in boot.js)
(function () {
    "use strict";

    var
        sources,
        idx = 0,
        loadSources = function () {
            var src;
            if (idx < sources.length) {
                src = sources[idx] + ".js";
                if ("undefined" !== typeof gpfSourcesPath) {
                    src = gpfSourcesPath + src;
                }
                gpf.http.include(src, {
                    load: loadSources
                });
                ++idx;
            } else {
                _gpfFinishLoading();
            }
        },
    // Ugly but fast way to insert sources
        head = document.getElementsByTagName("head")[0]
            || document.documentElement,

        include = function (src) {
            if ("undefined" !== typeof gpfSourcesPath) {
                src = gpfSourcesPath + src;
            }
            var script = document.createElement("script");
            script.language = "javascript";
            script.src = src;
            head.insertBefore(script, head.firstChild);
        },
    // Sequence of things to load (followed by test)
        bootList = ["sources", "sources",
            "compatibility", "setReadOnlyProperty",
            "constants", "_constants",
            "base", "each",
            "events", "events",
            "http", "http"],
        boot = function () {
            if (0 === idx % 2) {
                include(bootList[idx] + ".js");
                ++idx;
            } else {
                if (undefined !== gpf[bootList[idx]]) {
                    ++idx;
                }
            }
            if (idx === bootList.length) {
                /*
                 * Now that include & sources are loaded,
                 * load the missing sources
                 */
                sources = gpf.sources().split(",");
                idx = gpf.test(sources, "http") + 1;
                loadSources();
            } else {
                /**
                 * Use an aggressive setting but will be used only for
                 * the source version
                 */
                window.setTimeout(boot, 0);
            }
        };
    boot();
}());