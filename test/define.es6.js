"use strict";

/*jshint esversion: 6 */
/*eslint-env es6*/

describe("define.es6", function () {

    describe("gpf.define", function () {

        describe("Class definition", function () {

            describe("Implementation", function () {

                describe("Subclassing an ES6 class", function () {

                    class A {
                        constructor (value) {
                            this._a = "A";
                            this._value = value;
                        }
                        a () {
                            return this._a;
                        }
                        value () {
                            return this._value;
                        }
                    }

                    class B extends A {
                        constructor (value) {
                            super(value);
                            this._b = "B";
                        }
                        b () {
                            return this._b;
                        }
                    }

                    let C, c;

                    before(function () {
                        C = gpf.define({
                            $class: "C",
                            $extend: B,
                            "constructor": function (value) {
                                this.$super(value);
                            },
                            a: function () {
                                return this.$super();
                            },
                            c: function () {
                                return this.a() + this.b();
                            }
                        });

                        c = new C(3475);
                    });

                    it("handles instanceof", function () {
                        assert(c instanceof A);
                        assert(c instanceof B);
                        assert(c instanceof C);
                    });

                    it("calls the constructor function", function () {
                        assert(c.value() === 3475);
                    });

                    it("offers a way to call named base method", function () {
                        assert(c.c() === "AB");
                    });

                    it("does not leak $super", function () {
                        assert(undefined === c.$super);
                    });

                });

            });

        });

    });

});
