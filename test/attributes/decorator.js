"use strict";

describe("attributes/decorator", function () {

    describe("gpf.attributes.decorator", function () {

        function OldClass () {}

        it("can't be used on a non-es6 class", function () {
            var exceptionCaught;
            try {
                gpf.attributes.decorator()(OldClass);
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.Es6classOnly);
        });

    });

});

if (config.features.es6class) {

    include("attributes/decorator.es6");

}
