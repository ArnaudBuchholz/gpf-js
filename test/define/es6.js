"use strict";

/*jshint esversion: 6 */
/*eslint-env es6*/

if (gpf.host() !== gpf.hosts.nodejs) {
    return; // ignore
}

describe("define.es6", function () {

    describe("gpf.define", function () {

        class A {
            constructor () {
                this._a = "A";
            }
        }

        describe("gpf.define.isES6Class", function () {

            it("recognizes ES6 classes", function () {
                assert(gpf.define.isES6Class(A));
            });

            [
                undefined,
                null,
                false,
                true,
                "",
                "Hello World!",
                0,
                1,
                function NotAnES6Class () {}

            ].forEach(function (dataToTest) {

                it("fails on everything else (" + JSON.stringify(dataToTest) + ")", function () {
                    assert(!gpf.define.isES6Class(dataToTest));
                });

            });

        });

        describe("Class definition", function () {

            class B extends A {
                constructor () {
                    super();
                    this._b = "B";
                }
            }

            it("can extend an ES6 class", function () {
                var C = gpf.define({
                    $class: "C",
                    $extend: B,

                    constructor: function () {
                        this.$super();
                        this._c = "C";
                    }
                });

                var c = new C();
                assert(c instanceof C);
                assert(c._c === "C");
                assert(c instanceof B);
                assert(c._b === "B");
                assert(c instanceof A);
                assert(c._a === "A");
            });

        });

    });

});
