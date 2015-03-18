"use strict";
/*global describe, it, assert*/

describe("async", function () {

    describe("gpf.defer", function () {

        it("triggers the callback asynchronously", function (done) {
            var flag = 0;
            gpf.defer(function () {
                assert(1 === flag);
                done();
            }, 0);
            flag = 1;
        });

        it("transmits scope", function (done) {
            var scope = {};
            gpf.defer(function () {
                assert(this === scope);
                done();
            }, 0, scope);
        });

        it("transmits parameters", function (done) {
            var scope = {},
                obj = {};
            gpf.defer(function (a, b, c, d) {
                assert(this === scope);
                assert(arguments.length === 4);
                assert(1 === a);
                assert("abc" === b);
                assert(undefined === c);
                assert(obj === d);
                done();
            }, 0, scope, [1, "abc", undefined, obj]);
        });

    });

});