"use strict";

describe("attributes/attribute", function () {

    it("is abstract", function () {
        var exceptionCaught;
        try {
            var instance = new gpf.attributes.Attribute();
            assert(!instance);
        } catch (e) {
            exceptionCaught = e;
        }
        assert(exceptionCaught instanceof gpf.Error.AbstractClass);
    });

});
