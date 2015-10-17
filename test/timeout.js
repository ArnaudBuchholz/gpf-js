"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

describe("timeout", function () {

    it("triggers the callback asynchronously", function (done) {
        var flag = 0,
            timeoutId;
        timeoutId = setTimeout(function () {
            assert(1 === flag);
            done();
        }, 0);
        assert(timeoutId !== undefined);
        flag = 1;
    });

    it("transmits scope", function (done) {
        var scope = {},
            /**
             * Will be bound
             *
             * @this
             */
            callback = function () {
                assert(this === scope);
                done();
            };
        setTimeout(callback.bind(scope), 0);
    });

    it("transmits parameters", function (done) {
        var scope = {},
            obj = {},
            /**
             * Will be bound
             *
             * @this
             */
            callback = function (a, b, c) {
                assert(this === scope);
                assert(arguments.length === 3);
                assert(1 === a);
                assert(undefined === b);
                assert(obj === c);
                done();
            };
        setTimeout(callback.bind(scope, 1, undefined, obj), 0);
    });

});
