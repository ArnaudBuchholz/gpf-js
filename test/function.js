"use strict";

/*jshint -W055*/

describe("function", function () {

    if (gpf.internals) {

        describe("_GpfFunctionBuilder", function () {

            var _GpfFunctionBuilder = gpf.internals._GpfFunctionBuilder,
                _gpfObjectForEach = gpf.internals._gpfObjectForEach;

            _gpfObjectForEach({
                "Object": Object,
                "Function": Function,
                "String": String,
                "Array": Array
            }, function (nativeFunction, name) {

                it("detects native functions (" + name + ")", function () {
                    var builder = new _GpfFunctionBuilder(nativeFunction);
                    assert(true === builder.isNative);
                });

            });

            it("parses a function", function () {
                function test (a, b) {
                    return a + b;
                }
                var builder = new _GpfFunctionBuilder(test);
                assert("test" === builder.name);
                assert(2 === builder.parameters.length);
                assert("a" === builder.parameters[0]);
                assert("b" === builder.parameters[1]);
            });

            it("parses a function (with comments)", function () {
                /*jshint laxcomma:true*/
                /*jshint -W014*/
                function /*name is */ test2 (/*first*/a,
                    b // second parameter
                    ,   /*before*/      c   /*after*/
                    ) {
                    /*comments are removed*/
                    return a + b + c;
                }
                var builder = new _GpfFunctionBuilder(test2);
                assert("test2" === builder.name);
                assert(3 === builder.parameters.length);
                assert("a" === builder.parameters[0]);
                assert("b" === builder.parameters[1]);
                assert("c" === builder.parameters[2]);
            });

            it("parses a function (no parameters)", function () {
                function test3 () {
                    return 0;
                }
                var builder = new _GpfFunctionBuilder(test3);
                assert("test3" === builder.name);
                assert(0 === builder.parameters.length);
            });

            it("can be used to create an anonymous function", function () {
                var builder = new _GpfFunctionBuilder(),
                    result;
                builder.body = "return 1;";
                result = builder.generate();
                assert("" === result.compatibleName());
                assert(1 === result());
            });

            it("can be used to create a named function", function () {
                var builder = new _GpfFunctionBuilder(),
                    result;
                builder.name = "test";
                builder.body = "return 2;";
                result = builder.generate();
                assert("test" === result.compatibleName());
                assert(2 === result());
            });

        });

    }

});
