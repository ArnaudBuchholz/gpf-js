"use strict";

describe("abstract", function () {

    if (gpf.internals) {
        var _gpfCreateAbstractFunction = gpf.internals._gpfCreateAbstractFunction;

        describe("_gpfCreateAbstractFunction", function () {

            it("generates a function with a given signature", function () {
                var abstractFunc = _gpfCreateAbstractFunction(3);
                assert(abstractFunc.length === 3);
            });

            it("generates a function that throws the abstractMethod exception", function () {
                var abstractFunc = _gpfCreateAbstractFunction(0),
                    exceptionCaught;
                try {
                    abstractFunc();
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.AbstractMethod);
            });

        });

    }

});
