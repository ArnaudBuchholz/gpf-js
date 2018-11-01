"use strict";
/*global window, global*/

describe("context", function () {

    describe("gpf.context", function () {

        var safeFunc = Function; // Avoid linter warnings

        it("resolves the global context", function () {
            assert(typeof gpf.context === "function");
            assert(gpf.context() !== null);
            // Known and testable contexts
            if (gpf.hosts.browser === gpf.host()) {
                assert(window === gpf.context());
            } else if (gpf.hosts.nodejs === gpf.host() || gpf.hosts.phantomjs === gpf.host()) {
                assert(global === gpf.context());
            } else {
                var context = safeFunc("return this;")();
                assert(context === gpf.context());
            }
        });

        it("resolves gpf", function () {
            assert(gpf === gpf.context("gpf"));
        });

        it("resolves any symbol", function () {
            assert(gpf.context === gpf.context("gpf.context"));
        });

        it("returns undefined if not existing", function () {
            assert(undefined === gpf.context("gpf.not-existing"));
        });

        it("returns undefined if not existing (deep dive)", function () {
            assert(undefined === gpf.context("gpf.not-existing.really-not"));
        });

    });

    if (gpf.internals) {

        describe("_gpfContext", function () {
            var _gpfContext = gpf.internals._gpfContext;

            it("can build a context", function () {
                var mainContext = gpf.context(),
                    testContext = {};
                mainContext.testContextJS = testContext;
                var test = _gpfContext(["testContextJS", "folder", "name"], true);
                assert(testContext.folder.name === test);
                delete mainContext.testContextJS;
            });

        });

    }

});
