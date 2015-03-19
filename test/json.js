"use strict";
/*global describe, it, assert*/

describe("json", function () {

    var
        tests = [{
            label: "empty object",
            obj: {},
            json: "{}"

        } , {
            label: "simple string property",
            obj: {
                a: "123"
            },
            json: "{\"a\":\"123\"}"

        }],
        len = tests.length,
        idx;

    describe("gpf.json.stringify", function () {

        for (idx = 0; idx < len; ++idx) {
            (function (test) {
                it("works on " + test.label, function () {
                    assert(gpf.json.stringify(test.obj) === test.json);
                });
            })(tests[idx]);
        }

    });

    describe("gpf.json.parse", function () {

        for (idx = 0; idx < len; ++idx) {
            (function (test) {
                it("works on " + test.label, function () {
                    var obj =  gpf.json.parse(test.json);
                    assert(true === gpf.like(obj, test.obj));
                });
            })(tests[idx]);
        }

    });

});
