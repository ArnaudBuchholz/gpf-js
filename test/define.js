"use strict";

describe("define", function () {

    describe("gpf.define", function () {

        it("accepts only one parameter", function () {
            assert("function" === typeof gpf.define);
            assert(1 === gpf.define.length);
        });

        describe("Simple class description", function () {

            var A = gpf.define({
                $class: "A",
                _member: "defaultValue",
                getMember: function () {
                    return this._member;
                }
            });

            it("prevents constructor functions to be used without new", function () {
                var exceptionCaught;
                try {
                    A(); // eslint-disable-line new-cap
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error);
                assert(exceptionCaught.code === gpf.Error.CODE_CONSTRUCTORFUNCTION);
                assert(exceptionCaught.name === "constructorFunction");
            });

            var a = new A();

            it("handles instanceof", function () {
                assert(a instanceof A);
            });

            it("exposes methods", function () {
                assert("function" === a.getMember);
                assert("defaultValue" === a.getMember());
            });

        });

    });

});
