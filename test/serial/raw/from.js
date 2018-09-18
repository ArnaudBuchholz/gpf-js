"use strict";

describe("serial/raw/from", function () {

    describe("gpf.serial.buildFromRaw", function () {

        var A;

        before(function () {
            A = gpf.define({
                $class: "A",

                "[_id]": [new gpf.attributes.Serializable({
                    name: "id",
                    required: true
                })],
                _id: "",

                "[_name]": [new gpf.attributes.Serializable({
                    name: "name"
                })],
                _name: ""
            });
        });

        [
            undefined,
            null,
            0,
            1,
            false,
            true,
            "",
            "Hello World"

        ].forEach(function (value) {
            it("fails if used on a non class (" + JSON.stringify(value) + ")", function () {
                var exceptionCaught;
                try {
                    gpf.serial.buildFromRaw(value);
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.InvalidParameter);
            });
        });

        it("returns a function taking two parameters", function () {
            var aFromRaw = gpf.serial.buildFromRaw(A);
            assert(typeof aFromRaw === "function");
            assert(aFromRaw.length === 2);
        });

        describe("generated function", function () {

            var aFromRaw;

            before(function () {
                aFromRaw = gpf.serial.buildFromRaw(A);
            });

            [
                undefined,
                null,
                0,
                1,
                false,
                true,
                "",
                "Hello World",
                new Date(),
                function () {},
                {}
            ].forEach(function (value) {
                it("fails if the first parameter is not correct (" + JSON.stringify(value) + ")", function () {
                    var exceptionCaught;
                    try {
                        aFromRaw(value);
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.InvalidParameter);
                });
            });

            it("initializes the instance from the object containing the serializable properties", function () {
                var a = new A();
                aFromRaw(a, {
                    id: "id",
                    name: "Test"
                });
                assert(a._id === "id");
                assert(a._name === "Test");
            });

            it("initializes the instance from partial properties", function () {
                var a = new A();
                a._id = "id2";
                aFromRaw(a, {
                    name: "Test"
                });
                assert(a._id === "id2");
                assert(a._name === "Test");
            });

        });

    });

});
