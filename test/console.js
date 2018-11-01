"use strict";

describe("console", function () {

    if (gpf.internals) {
        var _gpfConsoleGenerate = gpf.internals._gpfConsoleGenerate;

        describe("_gpfConsoleGenerate", function () {

            it("generates an object mocking the console", function () {
                var result = _gpfConsoleGenerate();
                assert(typeof result.log === "function");
                assert(typeof result.info === "function");
                assert(typeof result.warn === "function");
                assert(typeof result.error === "function");
            });

            it("generates a log function prefixing text with padding", function () {
                var output = "",
                    result = _gpfConsoleGenerate(function (text) {
                        output = text;
                    });
                result.log("test");
                assert(output === "    test");
            });

            it("generates an info function prefixing text with [?]", function () {
                var output = "",
                    result = _gpfConsoleGenerate(function (text) {
                        output = text;
                    });
                result.info("test");
                assert(output === "[?] test");
            });

            it("generates a warn function prefixing text with /!\\", function () {
                var output = "",
                    result = _gpfConsoleGenerate(function (text) {
                        output = text;
                    });
                result.warn("test");
                assert(output === "/!\\ test");
            });

            it("generates an error function prefixing text with (X)", function () {
                var output = "",
                    result = _gpfConsoleGenerate(function (text) {
                        output = text;
                    });
                result.error("test");
                assert(output === "(X) test");
            });

        });

    }

});
