"use strict";

// Because it is part of the test
/*jshint -W053*/
/*eslint-disable no-new-wrappers*/

describe("like", function () {

    var
        string = "Hello World!",
        object = {
            "number": 1,
            "string": string,
            "null": null,
            "object": {member: "value"},
            "function": function () {
                return string;
            }
        },
        object2 = gpf.extend({
            cloneOf: object
        }, object);

    describe("gpf.like", function () {

        it("supports basic comparisons", function () {
            assert(true === gpf.like(1, 1));
            assert(false === gpf.like(1, new Number(1)));
            assert(false === gpf.like(1, 2));
            assert(true === gpf.like(1, 1.0));
            assert(true === gpf.like("abc", "abc"));
            assert(false === gpf.like("abc", new String("abc")));
            assert(false === gpf.like("abc", "abcd"));
            assert(true === gpf.like(object, object));
        });

        it("supports alike comparisons", function () {
            assert(true === gpf.like(1, new Number(1), true));
            assert(false === gpf.like("1", new Number(1), true));
            assert(true === gpf.like("abc", new String("abc"), true));
            assert(false === gpf.like(0, new String("0"), true));
            assert(true === gpf.like(true, new Boolean(true), true));
            assert(false === gpf.like(0, new Boolean(false), true));
        });

        describe("objects", function () {

            it("compares object members", function () {
                assert(false === gpf.like(object, gpf.extend({rigtOnly: true}, object)));
                assert(false === gpf.like(gpf.extend({leftOnly: true}, object)), object);
            });

            it("compares members' value", function () {
                var left = gpf.extend({}, object),
                    right = gpf.extend({}, object);
                left.different = true;
                right.different = false;
                assert(false === gpf.like(left, right));
            });

            it("supports deep comparison", function () {
                assert(true === gpf.like(object, gpf.extend({}, object)));
                assert(true === gpf.like(object2, gpf.extend({}, object2)));
            });

            it("supports recursive comparison", function () {
                var left = gpf.extend({}, object),
                    right = gpf.extend({}, object);
                left.test1 = left;
                right.test1 = right;
                left.test2 = right;
                right.test2 = left;
                assert(true === gpf.like(left, right));
            });

            describe("class comparison", function () {

                function A () {
                    this.value = 0;
                }
                function B () {
                    this.value = 0;
                }

                var a = new A(),
                    b = new B();

                it("compares prototypes", function () {
                    assert(false === gpf.like(a, b));
                });

                it("supports alike comparison", function () {
                    assert(true === gpf.like(a, b, true));
                });

            });

        });

    });

});
