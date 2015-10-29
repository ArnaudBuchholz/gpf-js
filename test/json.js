"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

/*eslint-disable max-nested-callbacks*/

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

        }, {
            label: "function",
            obj: {
                a: 123,
                b: function () {}
            },
            json: "{\"a\":123}",
            parse: false
        }, {
            label: "array",
            obj: {
                a: [1, 2, 3]
            },
            json: "{\"a\":[1,2,3]}"
        }, {
            label: "null",
            obj: {
                a: null
            },
            json: "{\"a\":null}"
        }];

    describe("JSON object", function () {

        it("exists", function () {
            assert("undefined" !== typeof JSON);
        });

    });

    describe("JSON.stringify", function () {

        tests.forEach(function (test) {
            it("works on " + test.label, function () {
                assert(JSON.stringify(test.obj) === test.json);
            });
        });

    });

    describe("JSON.parse", function () {

        tests.forEach(function (test) {
            if (false === test.parse) {
                return;
            }
            it("works on " + test.label, function () {
                var obj = JSON.parse(test.json);
                assert(true === gpf.like(obj, test.obj));
            });
        });

    });

    if (gpf.internals) {

        describe("(internal)", function () {

            describe("_gpfJsonStringifyPolyfill", function () {

                tests.forEach(function (test) {
                    it("works on " + test.label, function () {
                        assert(gpf.internals._gpfJsonStringifyPolyfill(test.obj) === test.json);
                    });
                });

            });

            describe("_gpfJsonParsePolyfill", function () {

                tests.forEach(function (test) {
                    if (false === test.parse) {
                        return;
                    }
                    it("works on " + test.label, function () {
                        var obj = gpf.internals._gpfJsonParsePolyfill(test.json);
                        assert(true === gpf.like(obj, test.obj));
                    });
                });

            });

        });

    }

});
