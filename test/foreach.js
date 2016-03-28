"use strict";

describe("foreach", function () {

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
        },
        objectMembers = "number,string,null,object,function";

    describe("gpf.forEach", function () {

        it("enumerates array content", function () {
            var count = 0,
                sum = 0;
            gpf.forEach(array, function (value, idx, refArray) {
                assert("number" === typeof idx);
                assert(refArray === array);
                ++count;
                sum += value;
            });
            assert(array.length === count);
            assert(45 === sum);
        });

        it("transmits scope on array content", function () {
            var count = 0,
                sum = 0,
                result;
            result = gpf.forEach(array, function (value, idx, refArray) {
                assert(this === object); //eslint-disable-line no-invalid-this
                assert("number" === typeof idx);
                assert(refArray === array);
                ++count;
                sum += value;
            }, object);
            assert(undefined === result);
            assert(array.length === count);
            assert(45 === sum);
        });

        it("enumerates object content and handles null value", function () {
            var members = [],
                result = true;
            gpf.forEach(object, function (value, name, refObject) {
                assert("string" === typeof name);
                assert(refObject === object);
                members.push(name);
                if (name === "null" && value !== null) {
                    result = false;
                }
            });
            members = members.join(",");
            assert(objectMembers === members);
            assert(true === result);
        });

        it("transmits scope on object content", function () {
            var result = gpf.forEach(object, function (/*value, name, refObject*/) {
                assert(this === object); //eslint-disable-line no-invalid-this
            }, object);
            assert(undefined === result);
        });

    });

});
