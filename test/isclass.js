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

if (gpf.host() === gpf.hosts.nodejs) {

    require(__dirname.replace(/\btest\b.*/, "test/isclass.es6.js"));

}
