"use strict";
/*global describe, it, assert*/

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

    describe("each", function () {

        it("enumerates array content", function () {
            var
                count = 0,
                sum = 0;
            gpf.each(array, function (/*idx, value*/) {
                ++count;
                sum += arguments[1];
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

    describe("extend", function () {

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

});

gpf.declareTests({

        value: [

            function (test) {
                test.title("Most common conversions");
                var
                    idx,
                    parameters,
                    result,
                    date = new Date(2003,0, 22, 23, 45, 0, 0);
                for (idx = 0; idx < valuesTesting.length; ++idx) {
                    parameters = valuesTesting[idx];
                    result = gpf.value.apply(null, parameters);
                    test.equal(result, parameters[3], parameters[4]);
                }
                // Handle dates specifically
                test.like(gpf.value("2003-01-22 23:45:00", date), date,
                    "String to date");
                test.like(gpf.value(date, ""), "2003-01-22 23:45:00",
                    "Date to string");
            }

        ],

        like: [

            function (test) {
                /*jshint -W053 */
                test.title("Basic comparisons");
                test.assert(gpf.like(1, 1), "Same literal integers");
                test.assert(!gpf.like(1, new Number(1)),
                    "Same integers but one is an object");
                test.assert(gpf.like(1, new Number(1), true),
                    "Same integers but one is an object");
                test.assert(!gpf.like("1", new Number(1), true),
                    "Same integers but one is an object");
                test.assert(!gpf.like(1, 2), "Different integers");
                test.assert(gpf.like(1, 1.0), "Same floats");
                test.assert(gpf.like("abc", "abc"), "Same literal strings");
                test.assert(!gpf.like("abc", new String("abc")),
                    "Same strings but one is an object");
                test.assert(gpf.like("abc", new String("abc"), true),
                    "Same strings but one is an object");
                test.assert(!gpf.like("abc", "abcd"), "Different strings");
                test.assert(gpf.like(object, object), "Same object");
                test.assert(gpf.like(object, gpf.extend({}, object)),
                    "Object and a clone");
                if (gpf.host() === "browser") {
                    test.assert(gpf.like(document.body, document.body),
                        "Body element");
                }
                /*jshint +W053 */
            },

            function (test) {
                test.title("Recursive comparison (based on HTML document)");
                if (gpf.host() !== "browser") {
                    return;
                }
                /* More complex comparison */
                var equal1div1 = document.getElementById("equal_1_div1");
                var equal1div2;
                if (!equal1div1) {
                    var placeholder = document.getElementById("placeholder");
                    equal1div1 = placeholder.appendChild(
                        document.createElement("div"));
                    equal1div1.id = "equal_1_div1";
                    equal1div1.innerHTML = "<span>Hello World</span>";
                    equal1div2 = equal1div1.cloneNode(true);
                    equal1div2.id = "equal_1_div2";
                    equal1div2 = placeholder.appendChild(equal1div2);
                } else {
                    equal1div2 = document.getElementById("equal_1_div1");
                }
                gpf.like(equal1div1, equal1div2, "HTML comparison");
            }

        ],

        test: [

            function (test) {
                test.title("Array manipulation");
                test.equal(gpf.test(array, 2), 2,
                    "Value existing in the array");
                test.equal(gpf.test(array, 11), undefined,
                    "Value missing in the array");
            },

            function (test) {
                test.title("Object manipulation");
                test.equal(gpf.test(object, null), "null",
                    "Null value existing in the object");
                test.equal(gpf.test(object, 1), "number",
                    "Value existing in the object");
                test.equal(gpf.test(object, "number"), undefined,
                    "Value missing in the array");
            }

        ],

        set: [

            function (test) {
                test.title("Array manipulation");
                var
                    array2 = array.concat([]), // Clone array
                    result = gpf.set(array2, 11);
                test.equal(result, array2, "Result is the same object");
                test.notEqual(gpf.test(result, 11), undefined,
                    "Value existing in the array");
            }

        ],

        clear: [

            function (test) {
                test.title("Array manipulation");
                var
                    array2 = array.concat([]), // Clone array
                    result = gpf.clear(array2, 11);
                test.equal(result, array2, "Result is the same object");
                test.equal(result.length, array2.length,
                    "Unaltered on missing value");
                result = gpf.clear(array2, 2);
                test.equal(result, array2, "Result is the same object");
                test.equal(result.length, array.length - 1, "Value removed");
                test.equal(result.join(""), "013456789", "Value removed");
            }

        ],

        xor: [

            function (test) {
                test.title("XOR truth table");
                test.equal(gpf.xor(false, false), false, "0^0=0");
                test.equal(gpf.xor(false, true), true, "0^1=1");
                test.equal(gpf.xor(true, false), true, "1^0=1");
                test.equal(gpf.xor(true, true), false, "1^1=0");
            }

        ],

        capitalize: [

            function (test) {
                test.title("Capitalize basic tests");
                test.equal(gpf.capitalize("word"), "Word", "one word");
                test.equal(gpf.capitalize("two words"), "Two words",
                    "Two words");
                test.equal(gpf.capitalize("Two words"), "Two words",
                    "Already capitalized");
                test.equal(gpf.capitalize("éric"), "Éric",
                    "Accent capitalization");
            }

        ]

    });