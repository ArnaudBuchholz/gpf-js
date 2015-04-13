"use strict";
/*global describe, it, assert*/

describe("compatibility", function () {

    describe("Array", function () {

        it("should allow building an array with a given size", function () {
            var
                array = new Array(5),
                idx;
            assert(5 === array.length);
            for (idx = 0; idx < 5; ++idx) {
                assert(undefined === array[idx]);
            }
            assert("    " === array.join(" "));
        });

        it("should expose every", function () {
            var
                array = [];
            assert("function" === typeof array.every);
            assert(!array.hasOwnProperty("every"));
        });

        it("should return true when it goes over all items", function () {
            var
                array = [1, 2, 3, -6, 10],
                sum = 0,
                result;
            result = array.every(function (value) {
                sum += value;
                return true;
            });
            assert(true === result);
            assert(10 === sum);
        });

        it("should return false when it stops on a given item", function () {
            var
                array = [1, 2, 3, -6, 10],
                sum = 0,
                result;
            result = array.every(function (value) {
                if (value > 0) {
                    sum += value;
                    return true;
                }
                return false;
            });
            assert(false === result);
            assert(6 === sum);
        });

        it("should expose every(callback, thisArg)", function () {
            var
                array = [1, 2, 3, -6, 10],
                scope = {
                    sum: 0,
                    index: 0
                },
                result;
            result = array.every(function (value, idx) {
                assert(this === scope);
                this.index = idx;
                if (value > 0) {
                    this.sum += value;
                    return true;
                }
                return false;
            }, scope);
            assert(false === result);
            assert(6 === scope.sum);
            assert(3 === scope.index);
        });

        it("should expose forEach(callback)", function () {
            var
                array = [1, 2, 3],
                sum = 0;
            assert("function" === typeof array.forEach);
            assert(!array.hasOwnProperty("forEach"));
            array.forEach(function (value) {
                sum += value;
            });
            assert(6 === sum);
        });

        it("should expose forEach(callback, thisArg)", function () {
            var
                array = [1, 2, 3],
                obj = {
                    sum: 0
                };
            array.forEach(function (value) {
                this.sum += value;
            }, obj);
            assert(6 === obj.sum);
        });

        it("should expose indexOf()", function () {
            var
                obj = {},
                array = [1, 2, 3, obj, "abc"];
            assert("function" === typeof array.indexOf);
            assert(!array.hasOwnProperty("indexOf"));
            assert(-1 === array.indexOf(4));
            assert(0 === array.indexOf(1));
            assert(3 === array.indexOf(obj));
            assert(-1 === array.indexOf({}));
            assert(4 === array.indexOf("abc"));
        });

        it("should expose map(callback, thisArg)", function () {
            var
                obj = {},
                array = [1, 2, 3, obj, "abc"],
                result;
            assert("function" === typeof array.map);
            assert(!array.hasOwnProperty("map"));
            result = array.map(function (value, idx) {
                assert(this === obj);
                assert(value === array[idx]);
                return idx;
            }, obj);
            assert(result.length === array.length);
            assert(result[0] === 0);
            assert(result[4] === 4);
        });

    });

    describe("Function", function () {

        it("should detect undefined parameter", function () {
            var
                testFunction = function (expected) {
                    assert(arguments.length === expected);
                };
            testFunction(1);
            testFunction(2, "abc");
            testFunction(2, undefined);
            testFunction(3, undefined, undefined);
        });

        it("should expose bind(thisArg)", function () {
            var
                scope = {
                    member: null
                },
                testFunction = function (value) {
                    assert(this === scope);
                    this.member = value;
                },
                bound;
            assert("function" === typeof testFunction.bind);
            assert(!testFunction.hasOwnProperty("bind"));
            bound = testFunction.bind(scope);
            // Check the scope when calling bound
            bound(true);
            assert(true === scope.member);
            // Ignore applied scope when bound
            bound.apply({}, [false]);
            assert(false === scope.member);
        });

    });

    describe("Object", function () {

        it("allows defining read-only property", function () {
            var
                obj = {};
            assert("function" === typeof gpf.setReadOnlyProperty);
            gpf.setReadOnlyProperty(obj, "member", true);
            assert(true === obj.member);
        });

        if ("wscript" !== gpf.host()) {
            it("prevents modifying a read-only property", function () {
                var
                    obj = {},
                    failed = false;
                gpf.setReadOnlyProperty(obj, "member", true);
                try {
                    obj.member = false;
                } catch (e) {
                    failed = true;
                }
                assert(failed);
            });
        } else {
            it("prevents modifying a read-only property");
        }

    });

});