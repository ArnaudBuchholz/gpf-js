"use strict";

describe("serial/json/to", function () {

    describe("gpf.serial.buildToJSON", function () {

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
                    gpf.serial.buildToJSON(value);
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.InvalidParameter);
            });
        });

        it("returns a function taking one parameter", function () {
            var a2JSON = gpf.serial.buildToJSON(A);
            assert(typeof a2JSON === "function");
            assert(a2JSON.length === 1);
        });

        describe("generated function", function () {

            var a2JSON;

            before(function () {
                a2JSON = gpf.serial.buildToJSON(A);
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
                        a2JSON(value);
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
                var json = a2JSON(a);
                assert(Object.keys(json).length === 2);
                assert(json.id === "id");
                assert(json.name === "Test");
            });

        });

    });

});
