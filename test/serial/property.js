"use strict";

describe("serial/property", function () {

    if (gpf.internals) {

        var _gpfSerialPropertyCheck = gpf.internals._gpfSerialPropertyCheck;

        describe("_gpfSerialPropertyCheck", function () {

            it("validates name", function () {
                var exceptionCaught;
                try {
                    _gpfSerialPropertyCheck({
                        name: "OK",
                        type: gpf.serial.types.string
                    });
                } catch (e) {
                    exceptionCaught = e;
                }
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
                    try {
                        _gpfSerialPropertyCheck({
                            name: invalidName,
                            type: gpf.serial.types.string
                        });
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.InvalidSerialName);
                });
            });

        });

    }

});
