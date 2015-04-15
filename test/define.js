"use strict";
/*global describe, it, assert*/

describe("define", function () {

    describe("gpf.define", function () {

        var
            A = gpf.define("A", {

                protected: {

                    _a: 0

                },

                public: {

                    constructor: function (value) {
                        this._a = value;
                    },

                    a: function () {
                        return this._a;
                    }

                }

            }),

            B = gpf.define("B", A, {

                private: {

                    _b: 0

                },

                public: {

                    constructor: function (value) {
                        this._b = value;
                        this._super(value + 1);
                    },

                    b: function () {
                        return this._a + this._b;
                    }

                }

            });

        describe("validate definitions", function () {

            it("generates constructor functions", function () {
                assert(A instanceof Function);
                assert("A" === A.compatibleName());
                assert(B instanceof Function);
                assert("B" === B.compatibleName());
            });

        });

        describe("basic inheritance tests", function () {

            var a = new A(1),
                b = new B(1);

            it("handles instanceof", function () {
                assert(a instanceof A);
                assert(!(a instanceof B));
                assert(b instanceof B);
            });

            it("handles inherited instanceof", function () {
                assert(b instanceof A);
            });

            it("exposes method A::a and provides access to A::_a", function () {
                assert(!a.hasOwnProperty("a"));
                assert(a.a() === 1);
            });

            it("provides access to A::_a inside constructor of B", function () {
                assert(!b.hasOwnProperty("a"));
                assert(b.a() === 2);
            });

            it("provides access to A::_a inside B::b", function () {
                assert(!b.hasOwnProperty("b"));
                assert(b.b() === 3);
            });

        });

    });

});