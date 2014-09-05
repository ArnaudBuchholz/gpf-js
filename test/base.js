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
                gpf.each(array, function (/*idx, value*/) {
                    ++count;
                    sum += arguments[1];
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
                gpf.extend(result, object, function (/*obj, member*/) {
                    members.push(arguments[1]);
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

        ],

        callback: [

            function (test) {
                test.title("Basic callback");
                var callback = new gpf.Callback(function() {
                    test.equal(true, true, "Callback called");
                    test.done();
                });
                test.wait(1);
                callback.apply();
            },

            function (test) {
                test.title("Scoped callback (1)");
                var scope = {};
                test.wait(1);
                var callback = new gpf.Callback(function() {
                    test.equal(this, scope, "Scope inside definition");
                    test.done();
                }, scope);
                callback.apply();
            },

            function (test) {
                test.title("Scoped callback (2)");
                var scope = {};
                var callback = new gpf.Callback(function() {
                    test.equal(this, scope, "Scope inside apply");
                    test.done();
                });
                test.wait(1);
                callback.apply(scope);
            },

            function (test) {
                test.title("Callback with parameters");
                var scope = {};
                var callback = new gpf.Callback(function() {
                    test.equal(arguments.length, 2,
                        "Correct number of arguments");
                    test.equal(arguments[0], "string",
                        "First argument is correct");
                    test.equal(arguments[1], 123,
                        "Second argument is correct");
                    test.done();
                });
                test.wait(1);
                callback.apply(scope, ["string", 123]);
            },

            function (test) {
                test.title("Scope resolution");
                var scope = {};
                test.equal(gpf.Callback.resolveScope(scope), scope,
                    "When specified, scope is not altered");
                test.equal(gpf.Callback.resolveScope(false), false,
                    "When specified (false), scope is not altered");
                test.equal(gpf.Callback.resolveScope(0), 0,
                    "When specified (0), scope is not altered");
                test.equal(gpf.Callback.resolveScope(null), gpf.context(),
                    "When null, global scope is returned");
                test.equal(gpf.Callback.resolveScope(undefined), gpf.context(),
                    "When undefined, global scope is returned");
            },


            function (test) {
                test.title("Build param array");
                var result = gpf.Callback.buildParamArray(2);
                test.equal(result.length, 2,
                    "Size is based on count and parameter");
                test.equal(result[0], undefined,
                    "First item is not initialized");
                test.equal(result[1], undefined,
                    "Second item is not initialized");
            },

            function (test) {
                test.title("Build param array with parameters");
                var result = gpf.Callback.buildParamArray(2, [0, 1]);
                test.equal(result.length, 4,
                    "Size is based on count and parameter");
                test.equal(result[0], undefined,
                    "First item is not initialized");
                test.equal(result[1], undefined,
                    "Second item is not initialized");
                test.equal(result[2], 0,
                    "First additional parameter is set");
                test.equal(result[3], 1,
                    "First additional parameter is set");
            },

            function (test) {
                test.title("Use of param array with doApply");
                var result = gpf.Callback.buildParamArray(2, [0, 1]);
                test.wait(1);
                // can use a gpf.Callback or a function
                gpf.Callback.doApply(function() {
                    test.equal(arguments.length, 4,
                        "Correct number of arguments");
                    test.equal(arguments[0], "string",
                        "First argument is correct");
                    test.equal(arguments[1], 123,
                        "Second argument is correct");
                    test.equal(arguments[2], 0,
                        "Third argument is correct");
                    test.equal(arguments[3], 1,
                        "Fourth argument is correct");
                    test.done();
                }, null, result, "string", 123);
            }

        ]

    });

}()); /* End of privacy scope */
