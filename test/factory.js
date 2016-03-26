"use strict";

describe("factory", function () {

    if (gpf.internals) {

        describe("_gpfGenericFactory", function () {

            var _gpfGenericFactory = gpf.internals._gpfGenericFactory;

            it("calls any constructor", function () {
                function MyObject () {
                    this.value = 42;
                }
                var myInstance = _gpfGenericFactory.call(MyObject);
                assert(myInstance instanceof MyObject);
                assert(42 === myInstance.value);
            });

            it("forwards parameters", function () {
                var myArray = _gpfGenericFactory.call(Array, 42);
                assert(myArray instanceof Array);
                assert(42 === myArray.length);
            });

        });

    }

});
