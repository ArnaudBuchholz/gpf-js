"use strict";

/*jshint -W055*/

describe("function", function () {

    if (gpf.internals) {

        var _gpfFunctionDescribe = gpf.internals._gpfFunctionDescribe,
            _gpfFunctionBuild = gpf.internals._gpfFunctionBuild,
            _gpfExtractFunctionName = gpf.internals._gpfExtractFunctionName;

        describe("_gpfFunctionDescribe", function () {

            it("describes a named function", function () {
                var description = _gpfFunctionDescribe(function test (a, b) {
                    return a + b;
                });
                assert(description.name === "test");
                assert(description.parameters.length === 2);
                assert(description.parameters[0] === "a");
                assert(description.parameters[1] === "b");
                assert(description.body.indexOf("return a + b;") !== -1);
            });

            it("identifies an unnamed function", function () {
                var description = _gpfFunctionDescribe(function () {
                    return 0;
                });
                assert(!description.name);
                assert(!description.parameters);
                assert(description.body.indexOf("return 0;") !== -1);
            });

            it("identifies empty function", function () {
                var description = _gpfFunctionDescribe(function () {
                });
                assert(undefined === description.body);
            });

            it("filters out comments", function () {
                /*jshint laxcomma:true*/
                /*jshint -W014*/
                function /*name is */ test2 (/*first*/a,
                    b // second parameter
                    , /*before*/ c /*after*/
                ) {
                    /*comments are removed*/
                    return a + b + c;
                }
                var description = _gpfFunctionDescribe(test2);
                assert(description.name === "test2");
                assert(description.parameters.length === 3);
                assert(description.parameters[0] === "a");
                assert(description.parameters[1] === "b");
                assert(description.parameters[2] === "c");
                assert(description.body.indexOf("comments are removed") === -1);
            });

        });

        describe("_gpfFunctionBuild", function () {

            it("builds an empty anonymous function", function () {
                var func = _gpfFunctionBuild({});
                assert(typeof func === "function");
                assert(_gpfExtractFunctionName(func) === "");
            });

            it("builds a named function", function () {
                var func = _gpfFunctionBuild({
                    name: "test"
                });
                assert(_gpfExtractFunctionName(func) === "test");
            });

            it("builds a function with named parameters", function () {
                var func = _gpfFunctionBuild({
                    parameters: ["a", "b", "c"],
                    body: "return a + b + c;"
                });
                assert(func.length === 3);
                assert(func(1, 2, 3) === 6);
            });

            it("builds a function with external context", function () {
                var func = _gpfFunctionBuild({
                    body: "return a;"
                }, {
                    a: "Hello World!"
                });
                assert(func.length === 0);
                assert(func() === "Hello World!");
            });

        });

        describe("_gpfExtractFunctionName", function () {

            it("gets function name", function () {
                function thisName () {}
                assert(_gpfExtractFunctionName(thisName) === "thisName");
            });

            it("supports empty name", function () {
                var thisName = function () {}; //eslint-disable-line func-style
                assert(_gpfExtractFunctionName(thisName) === "");
            });

        });

    }

});
