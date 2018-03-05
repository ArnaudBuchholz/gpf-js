"use strict";

describe("compatibility/json", function () {

    var tests = [{
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

    function _like (a, b) {
        var typeofA = typeof a;
        if (typeofA !== typeof b) {
            return false;
        }
        if ("object" === typeofA && a && b) {
            return Object.keys(a).every(function (key) {
                return b.hasOwnProperty(key) && _like(a[key], b[key]);
            });
        }
        return a === b;
    }

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

    function _complexParsingTests (parseFunc) {

        it("supports reviver parameter - simple", function () {
            var obj = parseFunc("{\"a\": 5, \"b\": \"6\"}", function (key, value) {
                if ("number" === typeof value) {
                    return value * 2;
                }
                return value;
            });
            assert(true === _like(obj, {
                a: 10,
                b: "6"
            }));
        });

        it("supports reviver parameter - traversing", function () {
            var keys = [];
            parseFunc("{\"1\": 1, \"2\": 2, \"3\": {\"4\": 4, \"5\": {\"6\": 6}}}", function (key, value) {
                keys.push(key);
                return value;
            });
            assert(keys.length === 7);
            ["1", "2", "4", "6", "5", "3", ""].forEach(function (key, index) {
                assert(keys[index] === key);
            });
        });

    }

    describe("JSON.parse", function () {

        it("has the expected arity", function () {
            assert(JSON.parse.length === 2);
        });

        tests.forEach(function (test) {
            if (false === test.parse) {
                return;
            }
            it("works on " + test.label, function () {
                var obj = JSON.parse(test.json);
                assert(true === _like(obj, test.obj));
            });
        });

        _complexParsingTests(JSON.parse.bind(JSON));

    });

    if (gpf.internals) {

        describe("(internal)", function () {

            var _gpfJsonStringifyPolyfill = gpf.internals._gpfJsonStringifyPolyfill,
                _gpfJsonParsePolyfill = gpf.internals._gpfJsonParsePolyfill;

            describe("_gpfJsonStringifyPolyfill", function () {

                tests.forEach(function (test) {
                    it("works on " + test.label, function () {
                        assert(_gpfJsonStringifyPolyfill(test.obj) === test.json);
                    });
                });

            });

            describe("_gpfJsonParsePolyfill", function () {

                it("has the expected arity", function () {
                    assert(_gpfJsonParsePolyfill.length === 2);
                });

                tests.forEach(function (test) {
                    if (false === test.parse) {
                        return;
                    }
                    it("works on " + test.label, function () {
                        var obj = _gpfJsonParsePolyfill(test.json);
                        assert(true === _like(obj, test.obj));
                    });
                });

                _complexParsingTests(_gpfJsonParsePolyfill);

            });

        });

    }

});
