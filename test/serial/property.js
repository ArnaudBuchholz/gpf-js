"use strict";

describe("serial/property", function () {

    if (gpf.internals) {

        var _gpfSerialPropertyCheck = gpf.internals._gpfSerialPropertyCheck,
            values = [
                "",
                0,
                1,
                {},
                new Date(),
                true,
                false,
                "123"
            ];

        describe("_gpfSerialPropertyCheck", function () {

            it("validates name", function () {
                var exceptionCaught;
                try {
                    _gpfSerialPropertyCheck({
                        name: "OK"
                    });
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(!exceptionCaught);
            });

            [undefined].concat(values).forEach(function (invalidName) {
                it("rejects invalid names (" + JSON.stringify(invalidName) + ")", function () {
                    var exceptionCaught;
                    try {
                        _gpfSerialPropertyCheck({
                            name: invalidName
                        });
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.InvalidSerialName);
                });
            });

            values.forEach(function (invalidType) {
                it("rejects invalid types (" + JSON.stringify(invalidType) + ")", function () {
                    var exceptionCaught;
                    try {
                        _gpfSerialPropertyCheck({
                            name: "OK",
                            type: invalidType
                        });
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.InvalidSerialType);
                });
            });

        });

    }

});
