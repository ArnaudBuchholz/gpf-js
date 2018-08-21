"use strict";

describe("serial/property", function () {

    if (gpf.internals) {

        var _gpfSerialPropertyCheck = gpf.internals._gpfSerialPropertyCheck;

        describe("_gpfSerialPropertyCheck", function () {

            it("validates name", {
                var exceptionCaught;
                _gpfSerialPropertyCheck({
                    name: "OK"
                });
                assert(!exceptionCaught);
            });

            [
                undefined,
                0,
                1,
                {},
                new Date(),
                true,
                false,
                "",
                "123"
            ].forEach(function (invalidName) {
                it("rejects invalid names (" + JSON.stringify(invalidName) + ")", function () {
                    var exceptionCaught;
                    _gpfSerialPropertyCheck({
                        name: invalidName
                    });
                    assert(exceptionCaught instanceof gpf.Error.InvalidSerialName);
                });
            });

        });

    };

});
