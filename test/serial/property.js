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

            it("validates name and default properties", function () {
                var property = _gpfSerialPropertyCheck({
                    name: "OK"
                });
                assert(property.type === gpf.serial.types.string);
                assert(property.required === false);
            });

            it("validates properties", function () {
                var exceptionCaught;
                try {
                    _gpfSerialPropertyCheck({
                        name: "OK",
                        type: gpf.serial.types.string,
                        required: false
                    });
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(!exceptionCaught);
            });

            values
                .concat(undefined)
                .forEach(function (invalidName) {
                    it("rejects invalid 'name' (" + JSON.stringify(invalidName) + ")", function () {
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

            values
                .forEach(function (invalidType) {
                    it("rejects invalid 'type' (" + JSON.stringify(invalidType) + ")", function () {
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

            values
                .filter(function (value) {
                    return typeof value !== "boolean";
                })
                .forEach(function (invalidRequired) {
                    it("rejects invalid 'required' (" + JSON.stringify(invalidRequired) + ")", function () {
                        var exceptionCaught;
                        try {
                            _gpfSerialPropertyCheck({
                                name: "OK",
                                required: invalidRequired
                            });
                        } catch (e) {
                            exceptionCaught = e;
                        }
                        assert(exceptionCaught instanceof gpf.Error.InvalidSerialRequired);
                    });
                });

        });

    }

});
