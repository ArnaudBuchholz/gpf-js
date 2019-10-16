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
        if (typeofA === "object" && a && b) {
            return Object.keys(a).every(function (key) {
                return Object.prototype.hasOwnProperty.call(b, key) && _like(a[key], b[key]);
            });
        }
        return a === b;
    }

    describe("JSON object", function () {

        it("exists", function () {
            assert(typeof JSON !== "undefined");
        });

    });

    function _stringifyTests (stringifyFunc) {

        it("has the expected arity", function () {
            assert(stringifyFunc.length === 3);
        });

        var values = {
            "null": null,
            "0": 0,
            "false": false,
            "true": true,
            "\"Hello World!\"": "Hello World!",
            "\"\\\"string\\\"\"": "\"string\""
        };
        Object.keys(values).forEach(function (result) {

            it("converts " + result, function () {
                assert(stringifyFunc(values[result]) === result);
            });

        });

        tests.forEach(function (test) {
            it("works on " + test.label, function () {
                assert(stringifyFunc(test.obj) === test.json);
            });
        });

        it("filters out special values", function () {
            var result = stringifyFunc({
                x: undefined,
                y: Object
            });
            assert(result === "{}");
        });

        it("uses the replacer function on object", function () {
            var result = stringifyFunc({
                hello: "World",
                code: 0
            }, function (key, value) {
                if (typeof value === "string") {
                    return undefined;
                }
                return value;
            });
            assert(result === "{\"code\":0}");
        });

        it("uses the replacer function on array", function () {
            var result = stringifyFunc([
                "Hello",
                "World!"
            ], function (key, value) {
                // Key can be a number or a string depending on the host
                if (key.toString() === "0") {
                    return undefined;
                }
                return value;
            });
            assert(result === "[null,\"World!\"]");
        });

        it("uses the replacer whitelist", function () {
            var result = stringifyFunc({
                hello: "World",
                code: 0
            }, ["hello"]);
            assert(result === "{\"hello\":\"World\"}");
        });

        it("uses the space argument", function () {
            var result = stringifyFunc({a: 2}, null, " ");
            assert(result === "{\n \"a\": 2\n}");
        });

        it("uses the space argument (empty string)", function () {
            var result = stringifyFunc({a: 2}, null, "");
            assert(result === "{\"a\":2}");
        });

        it("uses the space argument (tab)", function () {
            var result = stringifyFunc({a: 2}, null, "\t");
            assert(result === "{\n\t\"a\": 2\n}");
        });

        it("uses the space argument (tab) on an array", function () {
            var result = stringifyFunc([1, 2], null, "\t");
            assert(result === "[\n\t1,\n\t2\n]");
        });

        it("uses the space argument (number < 10)", function () {
            var result = stringifyFunc({a: 2}, null, 5);
            assert(result === "{\n     \"a\": 2\n}");
        });

        it("uses the space argument (number > 10)", function () {
            var result = stringifyFunc({a: 2}, null, 11);
            assert(result === "{\n          \"a\": 2\n}");
        });
    }

    describe("JSON.stringify", function () {

        _stringifyTests(JSON.stringify);

    });

    function _parseTests (parseFunc) {

        it("has the expected arity", function () {
            assert(parseFunc.length === 2);
        });

        tests.forEach(function (test) {
            if (test.parse === false) {
                return;
            }
            it("works on " + test.label, function () {
                var obj = parseFunc(test.json);
                assert(_like(obj, test.obj) === true);
            });
        });

        it("supports reviver parameter - simple", function () {
            var obj = parseFunc("{\"a\": 5, \"b\": \"6\"}", function (key, value) {
                if (typeof value === "number") {
                    return value * 2;
                }
                return value;
            });
            assert(_like(obj, {
                a: 10,
                b: "6"
            }) === true);
        });

        it("supports reviver parameter - traversing", function () {
            var keys = [];
            parseFunc("{\"1\": 1, \"2\": 2, \"3\": {\"4\": 4, \"5\": {\"6\": 6}}}", function (key, value) {
                // Key can be a number or a string depending on the host
                keys.push(key.toString());
                return value;
            });
            assert(keys.length === 7);
            ["1", "2", "4", "6", "5", "3", ""].forEach(function (key, index) {
                assert(keys[index] === key);
            });
        });

    }

    describe("JSON.parse", function () {

        _parseTests(JSON.parse.bind(JSON));

    });

    if (gpf.internals) {

        describe("(internal)", function () {

            describe("_gpfJsonStringifyPolyfill", function () {

                _stringifyTests(gpf.internals._gpfJsonStringifyPolyfill);

            });

            describe("_gpfJsonParsePolyfill", function () {

                _parseTests(gpf.internals._gpfJsonParsePolyfill);

            });

        });

    }

});
