"use strict";
/*global describe, it, assert*/

describe("constants", function () {

    describe("boot", function () {

        it("should expose a version", function () {
            assert.equal(typeof gpf.version, "function");
            assert.equal(typeof gpf.version(), "string");
            var version = gpf.version();
            // Expected format MAJOR.MINOR[d]
            assert.notEqual(version.indexOf("."), -1);
            assert.notEqual(version.match(/[0-9]+\.[0-9]+d?/), null);
        });

        it("should expose the host name", function () {
            assert.equal(typeof gpf.host, "function");
            assert.equal(typeof gpf.host(), "string");
            var host = gpf.host();
            // Must be one of these
            assert.notEqual([
                "wscript",
                "phantomjs",
                "nodejs",
                "browser",
                "unknown"
            ].indexOf(host), -1);
        });

        it("should provide a context resolver", function () {
            assert.equal(typeof gpf.context, "function");
            assert.notEqual(typeof gpf.context(), null);
            assert.equal(gpf.context("gpf"), gpf);
            // Known and testable contexts
            if (gpf.host() === "browser") {
                assert.equal(gpf.context(), window);
            } else if (gpf.host() === "nodejs" || gpf.host() === "phantomjs") {
                assert.equal(gpf.context(), global);
            } else {
                assert.equal(gpf.context(),
                    (function () {return this;}).apply(null));
            }
        });

    });

});
