"use strict";
/*global window, global*/

describe("context", function () {

    describe("gpf.context", function () {

        it("resolves the global context", function () {
            assert("function" === typeof gpf.context);
            assert(null !== gpf.context());
            // Known and testable contexts
            if (gpf.HOST_BROWSER === gpf.host()) {
                assert(window === gpf.context());
            } else if (gpf.HOST_NODEJS === gpf.host() || gpf.HOST_PHANTOMJS === gpf.host()) {
                assert(global === gpf.context());
            } else {
                var context = (function () {
                    return this; //eslint-disable-line no-invalid-this
                }());
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

    });

});
