"use strict";

describe("serial/raw/to", function () {

    describe("gpf.serial.buildToRaw", function () {

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
                    gpf.serial.buildToRaw(value);
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.InvalidParameter);
            });
        });

        it("returns a function taking one parameter", function () {
            var a2Raw = gpf.serial.buildToRaw(A);
            assert(typeof a2Raw === "function");
            assert(a2Raw.length === 1);
        });

        describe("generated function", function () {

            var a2Raw;

            before(function () {
                a2Raw = gpf.serial.buildToRaw(A);
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
                it("fails if the parameter is not correct (" + JSON.stringify(value) + ")", function () {
                    var exceptionCaught;
                    try {
                        a2Raw(value);
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.InvalidParameter);
                });
            });

            it("generates an object containing only the serializable properties", function () {
                var a = new A();
                a._id = "id";
                a._name = "Test";
                var raw = a2Raw(a);
                assert(Object.keys(raw).length === 2);
                assert(raw.id === "id");
                assert(raw.name === "Test");
            });

        });

    });

});
