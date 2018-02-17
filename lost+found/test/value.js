"use strict";

describe("value", function () {

    describe("gpf.value", function () {

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

        [
            /* value parameters,                        expected result, message */
            [0, 1, undefined, 0,                        "nothing on numbers"],
            ["0", 1, undefined, 0,                      "number from string"],
            ["0", true, undefined, false,               "boolean from string (false)"],
            ["yes", false, undefined, true,             "boolean from string (true)"],
            [0, true, undefined, false,                 "boolean from number (false)"],
            [1, false, undefined, true,                 "boolean from number (true)"],
            [{}, false, undefined, false,               "boolean from anything else"],
            [undefined, "empty", undefined, "empty",    "nothing and use default value"],
            ["1.2", 1.1, undefined, 1.2,                "string to float"],
            ["1.2", 1, "number", 1.2,                   "string to float as a number"],
            [{}, 1, undefined, 1,                       "number from anything else"],
            [1, "", undefined, "1",                     "string fron number"],
            [1, object, undefined, object,              "object (only default)"],
            [new Date("2013-01-22"), "", undefined, "2013-01-22T00:00:00.000Z",
                "string from date"],
            ["2013-01-22T00:00:00.000Z", new Date(), undefined, new Date("2013-01-22"),
                "date from string"]

        ].forEach(function (parameters) {

            it("converts " + parameters[4], function () {
                var result = gpf.value.apply(null, parameters.slice(0, 3)),
                    expected = parameters[3];
                if ("object" === typeof result && "object" === typeof expected) {
                    // Compare string versions
                    assert(result.toString() === parameters[3].toString());
                } else {
                    assert(result === parameters[3]);
                }
            });

        });

    });

});
