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
                        if (typeof value === "object" && done.indexOf(value) === -1) {
                            done.push(value);
                            check(value, done);
                        }
                    }
                }
            }
            check(gpf, [gpf, gpf.internals]); // Skip gpf.internals if they are defined
        });

        it("should expose a version", function () {
            assert(typeof gpf.version === "function");
            assert(typeof gpf.version() === "string");
            var version = gpf.version();
            // Expected format MAJOR.MINOR[d]
            assert(version.indexOf(".") !== -1);
            assert(version.match(/[0-9]+\.[0-9]+d?/) !== null);
        });

        it("should expose the host type", function () {
            assert(typeof gpf.host === "function");
            assert(typeof gpf.host() === "string");
            var host = gpf.host();
            // Must be one of these
            assert([
                gpf.hosts.browser,
                gpf.hosts.nashorn,
                gpf.hosts.nodejs,
                gpf.hosts.phantomjs,
                gpf.hosts.rhino,
                gpf.hosts.unknown,
                gpf.hosts.wscript
            ].indexOf(host) !== -1);
        });

        describe("gpf.hosts enumeration", function () {
            [ // expected list of known host types
                "browser",
                "nodejs",
                "phantomjs",
                "unknown",
                "wscript"
            ].forEach(function (name) {
                it("declares gpf.hosts." + name, function () {
                    assert(undefined !== gpf.hosts[name]);
                });
            });
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
                    it("accepts " + stringValue, function () {
                        assert(_gpfIsUnsignedByte(value) === true);
                    });
                } else {
                    it("rejects " + stringValue, function () {
                        assert(_gpfIsUnsignedByte(value) === false);
                    });
                }
            });

        });

        describe("(internal) _gpfFuncImpl", function () {

            var _gpfFuncImpl = gpf.internals._gpfFuncImpl;

            it("fails if function can't be generated", function () {
                var exceptionCaught;
                try {
                    _gpfFuncImpl([], "{");
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught);
            });

        });

    }

});
