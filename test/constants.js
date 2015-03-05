"use strict";
/*global describe, it, assert*/

describe("constants", function () {

    describe("boot", function () {

        it("should expose a version", function () {
            assert("function" === typeof gpf.version);
            assert("string" === typeof gpf.version());
            var version = gpf.version();
            // Expected format MAJOR.MINOR[d]
            assert(-1 !== version.indexOf("."));
            assert(null !== version.match(/[0-9]+\.[0-9]+d?/));
        });

        it("should expose the host name", function () {
            assert("function" === typeof gpf.host);
            assert("string" === typeof gpf.host());
            var host = gpf.host();
            // Must be one of these
            assert(-1 !== [
                "wscript",
                "phantomjs",
                "nodejs",
                "browser",
                "unknown"
            ].indexOf(host));
        });

        it("should provide a context resolver", function () {
            assert("function" === typeof gpf.context);
            assert(null !== gpf.context());
            assert(gpf === gpf.context("gpf"));
            // Known and testable contexts
            if ("browser" === gpf.host()) {
                assert(window === gpf.context());
            } else if ("nodejs" === gpf.host() || "phantomjs" === gpf.host()) {
                assert(global === gpf.context());
            } else {
                var context = (function () {return this;}).apply(null);
                assert(context === gpf.context());
            }
        });

    });

});
