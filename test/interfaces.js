"use strict";

describe("interfaces", function () {

    describe("gpf.interfaces.IUnknown", function () {

        it("exists", function () {
            assert("function" === typeof gpf.interfaces.IUnknown);
        });

        it("is an interface", function () {
            var exceptionCaught;
            try {
                var instance = new gpf.interfaces.IUnknown();
                assert(instance);
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.InterfaceConstructorFunction);
        });

    });


});
