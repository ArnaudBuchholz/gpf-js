"use strict";
/*global describe, it, assert*/

describe("base", function () {

    describe("gpf as a module", function () {

        if ("nodejs" === gpf.host()) {

            it("supports multiple instances", function () {
                var
                    path = require("path"),
                    previousGpf = gpf,
                    gpf2;
                gpf2 = require(path.resolve(process.cwd(),
                    "build/gpf-debug.js"));
                assert("object" === typeof gpf2);
                assert(null !== gpf2);
                assert(previousGpf === gpf);
            });

        } else if ("browser" === gpf.host() || "phantomjs" === gpf.host()) {

            it("supports multiple includes", function (done) {
                var
                    previousGpf = gpf,
                    basePath;
                if (window.gpfSourcesPath) {
                    basePath = window.gpfSourcesPath;
                }
                gpf.web.include(basePath + "../build/gpf-debug.js", {
                    "ready": function () {
                        var gpf2 = gpf.noConflict();
                        assert("object" === typeof gpf2);
                        assert(null !== gpf2);
                        assert(previousGpf === gpf);
                        done();
                    }
                });
            });

        }

    });

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
        objectMembers = "number,string,null,object,function",
        objectMembersNoNull = "number,string,object,function",
        valuesTesting = [
            /* value parameters,                expected result, message */
            [0, 1, undefined, 0,
                "No conversion between numbers"],
            ["0", 1, undefined, 0,
                "Number from string"],
            ["0", true, undefined, false,
                "Boolean from string (false)"],
            ["yes", false, undefined, true,
                "Boolean from string (true)"],
            [undefined, "empty", undefined, "empty",
                "No conversion"],
            ["1.2", 1.1, undefined, 1.2,
                "String to float"],
            ["1.2", 1, "number", 1.2,
                "String to float as a number"]
        ];

    describe("gpf.each", function () {

        it("enumerates array content", function () {
            var
                count = 0,
                sum = 0;
            gpf.each(array, function (idx, value, len) {
                assert("number" === typeof idx);
                assert("number" === typeof len);
                assert(len === array.length);
                ++count;
                sum += value;
            });
            assert(array.length === count);
            assert(45 === sum);
        });

        it("transmits scope and result, handles a stop condition", function () {
            var
                arrayIdx = -1,
                result = gpf.each.apply(object, [array,
                    function (idx, value) {
                        if (idx === 7 && value === 7 && this === object) {
                            arrayIdx = idx;
                            return true;
                        }
                    }, string]);
            assert(7 === arrayIdx);
            assert(true === result);
        });

        it("enumerates object content and handles null value", function () {
            var
                members = [],
                result = gpf.each(object, function (name, value) {
                    if (typeof name === "string") {
                        members.push(name);
                    }
                    if (name === "null" && value !== null) {
                        return false;
                    }
                }, true);
            members = members.join(",");
            assert(objectMembers === members);
            assert(true === result);
        });

    });

    describe("gpf.extend", function () {

        it("extends objects members", function () {
            var
                result = {
                    "number": 0,
                    "string": 0,
                    "object": 0,
                    "function": 0
                },
                members = [],
                newResult = gpf.extend(result, object);
            assert(result === newResult); // Same object returned
            gpf.each(object, function (name, value) {
                if (value === result[name]) {
                    members.push(name);
                }
            });
            members = members.join(",");
            assert(members === objectMembers);
        });

        it("submits overwrite to a function", function () {
            var
                result = {
                    "number": 0,
                    "string": 0,
                    "object": 0,
                    "function": 0
                },
                members = [];
            gpf.extend(result, object, function (/*obj, member*/) {
                members.push(arguments[1]);
            });
            members = members.join(",");
            assert(members === objectMembersNoNull);
        });

        it("provides to the overwrite function all values", function () {
            var
                result = {
                    "number": 0,
                    "string": 0,
                    "null": 5,
                    "object": 0,
                    "function": 0
                },
                members = [];
            gpf.extend(result, object, function (obj, member, newValue) {
                if (0 === obj[member]) {
                    obj[member] = newValue;
                    members.push(member);
                }
            });
            members = members.join(",");
            assert(members === objectMembersNoNull);
        });

    });

    describe("gpf.value", function () {

        var date = new Date(2003, 0, 22, 23, 45, 0, 0);

        it("handles most common conversions", function () {
            var
                idx,
                parameters,
                result;
            for (idx = 0; idx < valuesTesting.length; ++idx) {
                parameters = valuesTesting[idx];
                result = gpf.value.apply(null, parameters);
                assert(result === parameters[3]);
            }
        });

        if (gpf.dateToComparableFormat) {
            it("handles date conversions", function () {
                assert(gpf.like(gpf.value("2003-01-22 23:45:00", date), date));
                assert(gpf.value(date, "") === "2003-01-22 23:45:00");
            });
        } else {
            it("handles date conversions");
        }

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
            var
                array2 = array.concat([]), // Clone array
                result = gpf.set(array2, 2);
            assert(result === array2);
            assert(result.length === array.length);
            assert(gpf.test(result, 2) !== undefined);
        });

        it("adds the value to the Array", function () {
            var
                array2 = array.concat([]), // Clone array
                result = gpf.set(array2, 11);
            assert(result === array2);
            assert(result.length === array.length + 1);
            assert(gpf.test(result, 11) !== undefined);
        });

    });

    describe("gpf.clear", function () {

        it("does not change the Array if not found", function () {
            var
                array2 = array.concat([]), // Clone array
                result = gpf.clear(array2, 11);
            assert(result === array2);
            assert(result.length === array2.length);
            assert(gpf.test(result, 11) === undefined);
        });

        it("removes the value from the Array when found", function () {
            var
                array2 = array.concat([]), // Clone array
                result = gpf.clear(array2, 2);
            assert(result === array2);
            assert(result.length === array.length - 1);
            assert(gpf.test(result, 2) === undefined);
            assert(result.join("") === "013456789");
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

});