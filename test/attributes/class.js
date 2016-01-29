"use strict";

describe("attributes/class", function () {

    var A = gpf.define("A", {
            "private": {

                "[_a]": [gpf.$ClassProperty(false)],
                _a: 0,

                "[aLittleBitMoreThanB]": [gpf.$ClassProperty(true, "b", "public")],
                aLittleBitMoreThanB: 0,

                "[internalProperty]": [gpf.$ClassProperty(true)],
                internalProperty: 0

            },
            "public": {

                constructor: function () {
                    this._a = 0;
                    this.aLittleBitMoreThanB = 1;
                }

            }
        }),
        a = new A();

    describe("gpf.$ClassProperty", function () {

        it("declares only one getter for read-only members", function () {
            assert("function" === typeof a.getA);
            assert(0 === a.getA.length);
            assert(!a.hasOwnProperty("getA"));
            assert(undefined === a.setA);
            assert(0 === a.getA());
        });

        it("declares a getter and a setter members", function () {
            assert("function" === typeof a.getB);
            assert(0 === a.getB.length);
            assert(!a.hasOwnProperty("getB"));
            assert("function" === typeof a.setB);
            assert(1 === a.setB.length);
            assert(!a.hasOwnProperty("setB"));
            assert(1 === a.getB());
            assert(1 === a.setB(2)); // Returns former value
            assert(2 === a.getB());
        });

    });

});
