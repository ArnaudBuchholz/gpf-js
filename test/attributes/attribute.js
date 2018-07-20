"use strict";

describe("attributes/attribute", function () {

    it("is abstract", function () {
        var exceptionCaught;
        try {
            var instance = new gpf.attributes.Attribute();
            throw new Error(instance.toString());
        } catch (e) {
            exceptionCaught = e;
        }
        assert(exceptionCaught instanceof gpf.Error.AbstractClass);
    });

});
