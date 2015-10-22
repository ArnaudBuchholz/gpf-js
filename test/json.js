"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

describe("json", function () {

    var
        tests = [{
            label: "empty object",
            obj: {},
            json: "{}"

        }, {
            label: "simple string property",
            obj: {
                a: "123"
            },
            json: "{\"a\":\"123\"}"

        }, {
            label: "simple number property",
            obj: {
                a: 123
            },
            json: "{\"a\":123}"

        }, {
            label: "simple boolean properties",
            obj: {
                a: true,
                b: false
            },
            json: "{\"a\":true,\"b\":false}"

        }, {
            label: "mixed simple properties",
            obj: {
                a: "123",
                b: 123,
                c: true,
                d: {}
            },
            json: "{\"a\":\"123\",\"b\":123,\"c\":true,\"d\":{}}"

        }],
        len = tests.length,
        idx;

    describe("JSON object", function () {

        it("exists", function () {
            assert("undefined" !== typeof JSON);
        });

    });

    describe("JSON.stringify", function () {

        function makeIt(test) {
            it("works on " + test.label, function () {
                assert(JSON.stringify(test.obj) === test.json);
            });
        }

        for (idx = 0; idx < len; ++idx) {
            makeIt(tests[idx]);
        }

    });

    describe("JSON.parse", function () {

        function makeIt(test) {
            it("works on " + test.label, function () {
                var obj = JSON.parse(test.json);
                assert(true === gpf.like(obj, test.obj));
            });
        }

        for (idx = 0; idx < len; ++idx) {
            makeIt(tests[idx]);
        }

    });

});
