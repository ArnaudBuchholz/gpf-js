"use strict";

describe("bootstrap", function () {

    if (gpf.internals) {

        describe("_gpfGetBootstrapMethod", function () {

            var _gpfGetBootstrapMethod = gpf.internals._gpfGetBootstrapMethod;
            gpf.context().test = {};

            function get42plus (x) {
                return 42 + x;
            }

            beforeEach(function () {
                _gpfGetBootstrapMethod("test.bootstrapped", function (path) {
                    assert("test.bootstrapped" === path);
                    return get42plus;
                });
            });

            it("defines a method", function () {
                assert("function" === typeof test.bootstrapped);
            });

            it("encapsulate final method within a bootstrap helper", function () {
                assert(get42plus !== test.bootstrapped);
            });

            describe("first call", function () {

                beforeEach(function () {
                    assert(43 === test.bootstrapped(1));
                });

                it("was replaced with the proper implementation", function () {
                    assert(get42plus === test.bootstrapped);
                });

            });

        });

    }

});
