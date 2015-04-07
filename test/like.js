"use strict";
/*global describe, it, assert*/
/*jshint -W053*/ // Because it is part of the test

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

        it("tolerates alike comparison", function () {
            assert(true === gpf.like(1, new Number(1), true));
            assert(false === gpf.like("1", new Number(1), true));
            assert(true === gpf.like("abc", new String("abc"), true));
            assert(false === gpf.like(0, new String("0"), true));
            assert(true === gpf.like(true, new Boolean(true), true));
            assert(false === gpf.like(0, new Boolean(false), true));
        });

        it("tolerates deep comparison", function () {
            assert(true === gpf.like(object, gpf.extend({}, object)));
            assert(true === gpf.like(object2, gpf.extend({}, object2)));
        });

        it("supports complex deep comparison");

    });

});
