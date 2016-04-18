"use strict";

describe("base", function () {

    // Global declarations
    var string = "Hello World!",
        object = {
            "number": 1,
            "string": string,
            "null": null,
            "object": {member: "value"},
            "function": function () {
                return string;
            }
        };

    describe("gpf.clone", function () {

        it("creates a shallow clone of an object", function () {
            var clonedObject = gpf.clone(object);
            assert(clonedObject.string === object.string);
            assert(clonedObject.object !== object.object);
            assert(clonedObject.object.member === object.object.member);
            assert(undefined === clonedObject["function"]); // Accepted
        });

    });

    describe("gpf.xor", function () {

        it("implements XOR truth table", function () {
            assert(gpf.xor(false, false) === false);
            assert(gpf.xor(false, true) === true);
            assert(gpf.xor(true, false) === true);
            assert(gpf.xor(true, true) === false);
        });

    });

    if (gpf.internals) {

        describe("(internal)", function () {

            if (gpf.HOST_NODEJS === gpf.host()) {

                describe("_gpfNodeBuffer2JsArray", function () {

                    var _gpfNodeBuffer2JsArray = gpf.internals._gpfNodeBuffer2JsArray;

                    it("converts a NodeJS buffer into an array", function () {
                        var buffer = new Buffer("abc"),
                            intArray = _gpfNodeBuffer2JsArray(buffer);
                        assert(97 === intArray[0]);
                        assert(98 === intArray[1]);
                        assert(99 === intArray[2]);
                    });

                });

            }

        });

    }

});
