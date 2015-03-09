"use strict";
/*global describe*/ // , it, assert*/

describe("callback", function () {
});

/*
function (test) {
    test.title("Fire on a Callback");
    var callback = new gpf.Callback(function (event) {
        test.equal(event.type(), "test", "Event type");
        test.done();
    });
    test.wait();
    gpf.events.fire("test", callback);
},


        callback: [

            function (test) {
                test.title("Basic callback");
                var callback = new gpf.Callback(function() {
                    test.equal(true, true, "Callback called");
                    test.done();
                });
                test.wait();
                callback.apply();
            },

            function (test) {
                test.title("Scoped callback (1)");
                var scope = {};
                test.wait();
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
                test.wait();
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
                test.wait();
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
                test.wait();
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

*/