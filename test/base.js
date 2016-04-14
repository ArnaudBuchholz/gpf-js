"use strict";

describe("base", function () {

    // Global declarations
    var
        string = "Hello World!",
        array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
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

    describe("gpf.test", function () {

        it("checks if an item exist in an Array", function () {
            assert(gpf.test(array, 2) === 2);
            assert(gpf.test(array, 11) === undefined);
        });

        it("checks if a member value exist in an Object", function () {
            assert(gpf.test(object, null) === "null");
            assert(gpf.test(object, 1) === "number");
            assert(gpf.test(object, "number") === undefined);
        });

    });

    describe("gpf.set", function () {

        it("does not alter the Array if the value already exists", function () {
            var array2 = array.concat([]), // Clone array
                result = gpf.set(array2, 2);
            assert(result === array2);
            assert(result.length === array.length);
            assert(gpf.test(result, 2) !== undefined);
        });

        it("adds the value to the Array", function () {
            var array2 = array.concat([]), // Clone array
                result = gpf.set(array2, 11);
            assert(result === array2);
            assert(result.length === array.length + 1);
            assert(gpf.test(result, 11) !== undefined);
        });

    });

    describe("gpf.clear", function () {

        it("does not change the Array if not found", function () {
            var array2 = array.concat([]), // Clone array
                result = gpf.clear(array2, 11);
            assert(result === array2);
            assert(result.length === array2.length);
            assert(gpf.test(result, 11) === undefined);
        });

        it("removes the value from the Array when found", function () {
            var array2 = array.concat([]), // Clone array
                result = gpf.clear(array2, 2);
            assert(result === array2);
            assert(result.length === array.length - 1);
            assert(gpf.test(result, 2) === undefined);
            assert(result.join("") === "013456789");
        });

        it("does not change the dictionary if not found", function () {
            var object2 = gpf.clone(object),
                result = gpf.clear(object2, 11);
            assert(result === object2);
            assert(undefined === gpf.test(object2, 11));
        });

        it("removes the value from the Array when found", function () {
            var object2 = gpf.clone(object),
                result = gpf.clear(object2, 1);
            assert(result === object2);
            assert(undefined === object2.number);
            assert(undefined === gpf.test(object2, 1));
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
