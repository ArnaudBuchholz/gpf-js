"use strict";

/*jshint esversion: 6 */
/*eslint-env es6*/

describe("define/class/abstract.es6", function () {

    describe("$abstract", function () {

        class A {
            get member () {
                return this._member;
            }

            constructor (memberValue) {
                if (memberValue) {
                    this._member = memberValue;
                }
            }
        }

        let B, C;

        before(function () {

            B = gpf.define({
                $class: "B",
                $extend: A,
                $abstract: true
            });

            class LocalC extends B {
            }

            C = LocalC;

        });

        function _noInstantiation (AbstractClass) {
            var exceptionCaught;
            try {
                var instance = new AbstractClass();
                throw new Error(instance.toString());
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.AbstractClass);
        }

        it("prevents instantiation of abstract class (B)", function () {
            _noInstantiation(B);
        });

        it("enables instantiation on subclass (C)", function () {
            const c = new C("defaultValue");
            assert(c.member === "defaultValue");
        });

    });

});
