"use strict";

describe("factory", function () {

    if (gpf.internals) {

        describe("_gpfNewApply", function () {

            var _gpfNewApply = gpf.internals._gpfNewApply;

            it("calls any constructor", function () {
                function MyObject () {
                    this.value = 42;
                }
                var myInstance = _gpfNewApply(MyObject, []);
                assert(myInstance instanceof MyObject);
                assert(42 === myInstance.value);
            });

            it("forwards parameters", function () {
                var myArray = _gpfNewApply(Array, [42]);
                assert(myArray instanceof Array);
                assert(42 === myArray.length);
            });

            it("adapts to a very long list of parameters", function () {
                var myArray = _gpfNewApply(Array, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
                assert(myArray instanceof Array);
                assert(15 === myArray.length);
            });

        });

    }

});
