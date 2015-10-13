"use strict";
/*global describe, it, assert*/

describe("constants", function () {

    describe("gpf", function () {

        it("does not expose any 'private' member", function () {
            function check(obj, done) {
                var property,
                    value;
                for (property in obj) {
                    if (obj.hasOwnProperty(property)) {
                        assert(property.charAt(0) !== "_");
                        value = obj[property];
                        if ("object" === typeof value && -1 === done.indexOf(value)) {
                            done.push(value);
                            check(value, done);
                        }
                    }
                }
            }
            check(gpf, [gpf]);
        });

        it("should expose a version", function () {
            assert("function" === typeof gpf.version);
            assert("string" === typeof gpf.version());
            var version = gpf.version();
            // Expected format MAJOR.MINOR[d]
            assert(-1 !== version.indexOf("."));
            assert(null !== version.match(/[0-9]+\.[0-9]+d?/));
        });

        it("should expose the host type", function () {
            assert("function" === typeof gpf.host);
            assert("string" === typeof gpf.host());
            var host = gpf.host();
            // Must be one of these
            assert(-1 !== [
                gpf.HOST_BROWSER,
                gpf.HOST_NODEJS,
                gpf.HOST_PHANTOMJS,
                gpf.HOST_RHINO,
                gpf.HOST_UNKNOWN,
                gpf.HOST_WSCRIPT
            ].indexOf(host));
        });

        describe("gpf.HOST_xxx", function () {
            [ // expected list of known host types
                "BROWSER",
                "NODEJS",
                "PHANTOMJS",
                "UNKNOWN",
                "WSCRIPT"
            ].forEach(function (eventName) {
                it("declares gpf.HOST_" + eventName, function () {
                    assert(undefined !== gpf["HOST_" + eventName]);
                });
            });
        });

        it("should provide a context resolver", function () {
            assert("function" === typeof gpf.context);
            assert(null !== gpf.context());
            assert(gpf === gpf.context("gpf"));
            // Known and testable contexts
            if (gpf.HOST_BROWSER === gpf.host()) {
                assert(window === gpf.context());
            } else if (gpf.HOST_NODEJS === gpf.host() || gpf.HOST_PHANTOMJS === gpf.host()) {
                assert(global === gpf.context());
            } else {
                var context = (function () {return this;}).apply(null);
                assert(context === gpf.context());
            }
        });

    });

});
