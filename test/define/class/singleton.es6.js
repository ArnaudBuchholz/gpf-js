"use strict";

/*jshint esversion: 6 */
/*eslint-env es6*/

describe("define/class/singleton.es6", function () {

    describe("$singleton", function () {

        describe("in a sub class", function () {

            class B {
                get uniqueObject () {
                    return this._unique;
                }

                constructor () {
                    this._unique = {};
                }
            }

            let C;

            before(function () {
                C = gpf.define({
                    $class: "C",
                    $extend: B,
                    $singleton: true
                });
            });

            it("does not alter base class behavior", function () {
                var b0 = new B(),
                    c0 = new C(),
                    unique = c0.uniqueObject,
                    b1 = new B(),
                    c1 = new C();
                assert(b0 !== b1);
                assert(b0.uniqueObject !== b1.uniqueObject);
                assert(c0 === c1);
                assert(unique === c1.uniqueObject);
            });

        });

    });

});
