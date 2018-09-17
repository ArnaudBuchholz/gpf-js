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

        it("does not skip undefined values", function () {
            var emptyArray = new Array(3),
                count = 0;
            gpf.forEach(emptyArray, function (value) {
                assert(undefined === value);
                ++count;
            });
            assert(3 === count);
        });

        it("does not enumerate inherited values", function () {
            var base = {
                    inherited: 1
                },
                objectFromBase = Object.create(base);
            objectFromBase.own = 2;
            gpf.forEach(objectFromBase, function (value, name) {
                assert(2 === value);
                assert("own" === name);
            });
        });

    });

    if (gpf.internals) {

        describe("(internal)", function () {

            describe("_gpfObjectForEach", function () {

                var _gpfObjectForEach = gpf.internals._gpfObjectForEach;

                it("enumerates object keys and values", function () {
                    var count = 0;
                    _gpfObjectForEach(object, function (value, index, refObject) {
                        ++count;
                        assert(refObject === object);
                        assert(value === object[index]);
                    });
                    assert(count === 5);
                });

            });

            describe("_gpfArrayForEachFalsy", function () {

                var _gpfArrayForEachFalsy = gpf.internals._gpfArrayForEachFalsy;

                it("enumerates all values if no truthy result", function () {
                    var count = 0,
                        result = _gpfArrayForEachFalsy(array, function (value, index, refArray) {
                            ++count;
                            assert(refArray === array);
                            assert(value === array[index]);
                        });
                    assert(result === undefined);
                    assert(count === array.length);
                });

                it("stops on first truthy value and return it", function () {
                    var count = 0,
                        expectedResult = {},
                        result = _gpfArrayForEachFalsy(array, function (value, index, refArray) {
                            if (value === 4) {
                                return expectedResult;
                            }
                            ++count;
                            assert(refArray === array);
                            assert(value === array[index]);
                        });
                    assert(result === expectedResult);
                    assert(count === 4);
                });

            });

        });

    }

});
