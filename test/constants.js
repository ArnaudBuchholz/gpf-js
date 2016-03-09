"use strict";

describe("constants", function () {

    describe("gpf", function () {

        it("does not expose any 'private' member", function () {
            function check (obj, done) {
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
            check(gpf, [gpf, gpf.internals]); // Skip gpf.internals if they are defined
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

        /*global window, global*/
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
                var context = (function () {
                    return this; //eslint-disable-line no-invalid-this
                }());
                assert(context === gpf.context());
            }
        });

    });

    if (gpf.internals) {

        describe("(internal) _gpfIsUnsignedByte", function () {

            var _gpfIsUnsignedByte = gpf.internals._gpfIsUnsignedByte;

            gpf.forEach({
                "0": true,
                "-25": false,
                "128": true,
                "256": false,
                "255": true

            }, function (expectedResult, stringValue) {
                var value = parseInt(stringValue, 10);
                if (expectedResult) {
                    it("accepts" + stringValue, function () {
                        assert(true === _gpfIsUnsignedByte(value));
                    });
                } else {
                    it("rejects " + stringValue, function () {
                        assert(false === _gpfIsUnsignedByte(value));
                    });
                }
            });

        });

    }

});
