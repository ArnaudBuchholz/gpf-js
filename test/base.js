(function () { /* Begin of privacy scope */
    "use strict";

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
            [0, 1, undefined,                   0,
                "No conversion between numbers"],
            ["0", 1, undefined,                 0,
                "Number from string"],
            ["0", true, undefined,              false,
                "Boolean from string (false)"],
            ["yes", false, undefined,           true,
                "Boolean from string (true)"],
            [undefined, "empty", undefined,     "empty",
                "No conversion"],
            ["1.2", 1.1, undefined,             1.2,
                "String to float"],
            ["1.2", 1, "number",                1.2,
                "String to float as a number"]
        ];

    gpf.declareTests({

        "each": [

            function (test) {
                test.title("Array content enumeration");
                var
                    count = 0,
                    sum = 0;
                gpf.each(array, function (idx, value) {
                    ++count;
                    sum += value;
                });
                test.equal(count, array.length, "Size of the array");
                test.equal(sum, 45, "Sum of each array item");
            },

            function (test) {
                test.title("Result and scope transmission, stopping condition");
                var
                    arrayIdx = -1,
                    result = gpf.each.apply(object, [array,
                        function (idx, value) {
                            if (idx === 7 && value === 7 && this === object) {
                                arrayIdx = idx;
                                return true;
                            } else {
                                return undefined;
                            }
                        }, string]);
                test.equal(arrayIdx, 7, "Stop index");
                test.assert(result, "Result");
            },

            function (test) {
                test.title("Object enumeration and null value");
                var
                    members = [],
                    result = gpf.each(object, function (name, value) {
                        if (typeof name === "string") {
                            members.push(name);
                        }
                        if (name === "null" && value !== null) {
                            return false;
                        }
                        return undefined;
                    }, true);

                members = members.join(",");
                test.equal(members, objectMembers, "All members");
                test.assert(result, "Enumeration completed");
            }

        ],

        "extend": [

            function (test) {
                test.title("Object extension and verification");
                /* Extend an object and verify it works */
                var
                    result = {
                        "number": 0,
                        "string": 0,
                        "object": 0,
                        "function": 0
                    },
                    members = [],
                    newResult = gpf.extend(result, object);
                test.equal(result, newResult, "Same object returned");
                gpf.each(object, function (name, value) {
                    if (value === result[name]) {
                        members.push(name);
                    }
                });
                members = members.join(",");
                test.equal(members, objectMembers,
                    "All properties are identical");
            },

            function (test) {
                test.title("Object extension with overwrite");
                var
                    result = {
                        "number": 0,
                        "string": 0,
                        "object": 0,
                        "function": 0
                    },
                    members = [];
                gpf.extend(result, object, function (obj, member) {
                    members.push(member);
                });
                members = members.join(",");
                test.equal(members, objectMembersNoNull, "Overwriting called");
            },

            function (test) {
                test.title("Object extension with overwrite of values");
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
                test.equal(members, objectMembersNoNull, "Overwriting called");
            }

        ],

        value: [

            function (test) {
                test.title("Most common conversions");
                var
                    idx,
                    parameters,
                    result;
                for (idx = 0; idx < valuesTesting.length; ++idx) {
                    parameters = valuesTesting[idx];
                    result = gpf.value.apply(null, parameters);
                    test.equal(result, parameters[3], parameters[4]);
                }
            }

        ],

        equal: [

            function (test) {
                test.title("Basic comparisons");
                test.assert(gpf.equal(1, 1), "Same literal integers");
                test.assert(!gpf.equal(1, new Number(1)),
                    "Same integers but one is an object");
                test.assert(!gpf.equal(1, 2), "Different integers");
                test.assert(gpf.equal(1, 1.0), "Same floats");
                test.assert(gpf.equal("abc", "abc"), "Same literal strings");
                test.assert(!gpf.equal("abc", new String("abc")),
                    "Same strings but one is an object");
                test.assert(!gpf.equal("abc", "abcd"), "Different strings");
                test.assert(gpf.equal(object, object), "Same object");
                test.assert(gpf.equal(object, gpf.extend({}, object)),
                    "Object and a clone");
                if (gpf.host() === "browser") {
                    test.assert(gpf.equal(document.body, document.body),
                        "Body element");
                }
            },

            function (test) {
                test.title("Recursive comparison (based on HTML document)");
                if (gpf.host() !== "browser") {
                    return;
                }
                /* More complex comparison */
                var equal_1_div1 = document.getElementById("equal_1_div1");
                var equal_1_div2;
                if (!equal_1_div1) {
                    var placeholder = document.getElementById("placeholder");
                    equal_1_div1 = placeholder.appendChild(
                        document.createElement("div"));
                    equal_1_div1.id = "equal_1_div1";
                    equal_1_div1.innerHTML = "<span>Hello World</span>";
                    equal_1_div2 = equal_1_div1.cloneNode(true);
                    equal_1_div2.id = "equal_1_div2";
                    equal_1_div2 = placeholder.appendChild(equal_1_div2);
                }
                else
                    equal_1_div2 = document.getElementById("equal_1_div1");
                gpf.equal(equal_1_div1, equal_1_div2, "HTML comparison");
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

    ]

    });

}());
/* End of privacy scope */
