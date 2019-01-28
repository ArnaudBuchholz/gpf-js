"use strict";

describe("isclass", function () {

    describe("gpf.isclass", function () {

        [
            undefined,
            null,
            false,
            true,
            "",
            "Hello World!",
            0,
            1,
            function NotAnES6Class () {}

        ].forEach(function (dataToTest) {

            it("fails on " + JSON.stringify(dataToTest), function () {
                assert(!gpf.isClass(dataToTest));
            });

        });

    });

});

if (config.features.es6class) {

    include("isclass.es6");

}
