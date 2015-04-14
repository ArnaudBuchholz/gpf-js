"use strict";
/*global describe, it, assert*/

describe("a_class", function () {

    var
        A = gpf.define("A", {

            private: {

                "[_a]": [gpf.$ClassProperty(false)],
                _a: 0,

                "[_aLittleBitMoreThanB]": [gpf.$ClassProperty(true, "b")],
                _aLittleBitMoreThanB: 0

            },

            public: {

                constructor: function () {
                    this._a = 0;
                    this._aLittleBitMoreThanB = 1;
                }

            }

        }),

        a = new A();

    describe("gpf.$ClassProperty", function () {

        it("declares a public member", function () {
            assert("function" === typeof a.a);
            assert(!a.hasOwnProperty("a"));
            assert("function" === typeof a.b);
            assert(!a.hasOwnProperty("b"));
        });

        it("declares a read-only accessor method", function () {
            var caught = null;
            assert(0 === a.a.length);
            assert(0 === a.a());
            try {
                a.a(2); // Should be read only
            } catch (e) {
                caught = e;
            }
            assert(null === caught);
            assert(0 === a.a());
        });

        it("declares a read-write accessor method", function () {
            assert(1 === a.b.length);
            assert(1 === a.b());
            a.b(2);
            assert(2 === a.b());
        });

    });

});