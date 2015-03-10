"use strict";
/*global describe*/ // , it, assert*/

describe("callback", function () {

    describe("gpf.Callback", function () {

        it("wraps any function and is called with call", function (done) {
            var callback = new gpf.Callback(done);
            callback.call();
        });

        it("wraps any function and is called with apply", function (done) {
            var callback = new gpf.Callback(done);
            callback.apply();
        });

        it("supports scope in constructor", function (done) {
            var scope = {},
                callback = new gpf.Callback(function() {
                    assert(this === scope);
                    done();
                }, scope);
            callback.apply();
        });

        it("supports scope in apply", function (done) {
            var scope = {},
                callback = new gpf.Callback(function() {
                    assert(this === scope);
                    done();
                });
            callback.apply(scope);
        });

        it("supports parameters in apply", function (done) {
            var scope = {};
            var callback = new gpf.Callback(function() {
                assert(arguments.length === 2);
                assert(arguments[0] === "string");
                assert(arguments[1] === 123);
                done();
            });
            callback.apply(scope, ["string", 123]);
        });

        it("resolves scope", function (done) {
            var scope = {};
            assert(gpf.Callback.resolveScope(scope) === scope);
            assert(gpf.Callback.resolveScope(false) === false);
            assert(gpf.Callback.resolveScope(0) === 0);
            assert(gpf.Callback.resolveScope(null) === gpf.context());
            assert(gpf.Callback.resolveScope(undefined) === gpf.context());
        });

        it("can be used in gpf.events.fire", function (done) {
            var callback = new gpf.Callback(function (event) {
                assert(event.type === "test");
                done();
            });
            gpf.events.fire("test", callback);
        });

    });

});

/*


        callback: [

            function (test) {
                test.title("Callback with parameters");
            },

            function (test) {
                test.title("Scope resolution");
            },


            function (test) {
                test.title("Build param array");
                var result = gpf.Callback.buildParamArray(2);
                assert(result.length, 2,
                    "Size is based on count and parameter");
                assert(result[0], undefined,
                    "First item is not initialized");
                assert(result[1], undefined,
                    "Second item is not initialized");
            },

            function (test) {
                test.title("Build param array with parameters");
                var result = gpf.Callback.buildParamArray(2, [0, 1]);
                assert(result.length, 4,
                    "Size is based on count and parameter");
                assert(result[0], undefined,
                    "First item is not initialized");
                assert(result[1], undefined,
                    "Second item is not initialized");
                assert(result[2], 0,
                    "First additional parameter is set");
                assert(result[3], 1,
                    "First additional parameter is set");
            },

            function (test) {
                test.title("Use of param array with doApply");
                var result = gpf.Callback.buildParamArray(2, [0, 1]);
                test.wait();
                // can use a gpf.Callback or a function
                gpf.Callback.doApply(function() {
                    assert(arguments.length, 4,
                        "Correct number of arguments");
                    assert(arguments[0], "string",
                        "First argument is correct");
                    assert(arguments[1], 123,
                        "Second argument is correct");
                    assert(arguments[2], 0,
                        "Third argument is correct");
                    assert(arguments[3], 1,
                        "Fourth argument is correct");
                    test.done();
                }, null, result, "string", 123);
            }

        ]

*/