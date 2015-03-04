"use strict";
/*global describe, it, assert*/

describe("compatibility", function () {

    describe("Array", function () {

        it("should allow building an array with a given size", function () {
            var
                array = new Array(5),
                idx;
            assert.equal(array.length, 5);
            for (idx = 0; idx < 5; ++idx) {
                assert.equal(array[idx], undefined);
            }
            assert.equal(array.join(" "), "    ");
        });

        it("should expose forEach(callback)", function () {
            var
                array = [1, 2, 3],
                sum = 0;
            assert.equal(typeof array.forEach, "function");
            assert.equal(array.hasOwnProperty("forEach"), false);
            array.forEach(function (value) {
                sum += value;
            });
            assert.equal(sum, 6);
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
            assert.equal(obj.sum, 6);
        });

        it("should expose indexOf()", function () {
            var
                obj = {},
                array = [1, 2, 3, obj, "abc"];
            assert.equal(typeof array.indexOf, "function");
            assert.equal(array.hasOwnProperty("indexOf"), false);
            assert.equal(array.indexOf(4), -1);
            assert.equal(array.indexOf(1), 0);
            assert.equal(array.indexOf(obj), 3);
            assert.equal(array.indexOf({}), -1);
            assert.equal(array.indexOf("abc"), 4);
        });

    });

    describe("Function", function () {

        it("should expose bind(thisArg)", function () {
            var
                scope = {
                    member: null
                },
                testFunction = function (value) {
                    assert.ok(this === scope);
                    this.member = value;
                },
                bound;
            assert.equal(typeof testFunction.bind, "function");
            assert.equal(testFunction.hasOwnProperty("bind"), false);
            bound = testFunction.bind(scope);
            // Check the scope when calling bound
            bound(true);
            assert.equal(scope.member, true);
            // Ignore applied scope when bound
            bound.apply({}, [false]);
            assert.equal(scope.member, false);
        });

    });

    describe("Object", function () {

        it("allows defining read-only property", function () {
            var
                obj = {};
            assert.equal(typeof gpf.setReadOnlyProperty, "function");
            gpf.setReadOnlyProperty(obj, "member", true);
            assert.equal(obj.member, true);
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
                assert.ok(failed);
            });
        } else {
            it("prevents modifying a read-only property");
        }

    });

});