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

        });

    }

});
