"use strict";

describe("define", function () {

    describe("gpf.define", function () {

        it("accepts only one parameter", function () {
            assert("function" === typeof gpf.define);
            assert(1 === gpf.define.length);
        });

        describe("Simple class description", function () {

            describe("Validation", function () {

                it("checks that he entity type is specified", function () {
                    var exceptionCaught;
                    try {
                        gpf.define({});
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.InvalidEntityType);
                });

                [
                    "1NumberAtTheBeginningIsNotOK",
                    "noUppercaseFirstLetterIsNotOK",
                    "DollarSignAnywhereIsNotOK$"
                ].forEach(function (invalidClassName) {
                    it("rejects invalid class name (" + invalidClassName + ")", function () {
                        var exceptionCaught;
                        try {
                            gpf.define({
                                $class: invalidClassName
                            });
                        } catch (e) {
                            exceptionCaught = e;
                        }
                        assert(exceptionCaught instanceof gpf.Error.InvalidClassName);
                    });
                });

            });

            it("rejects invalid $ property names", function () {
                var exceptionCaught;
                try {
                    gpf.define({
                        $class: "Test",
                        $test: false
                    });
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.InvalidClassProperty);
            });

            it("rejects invalid property names (reserved keywords)", function () {
                var exceptionCaught;
                try {
                    gpf.define({
                        $class: "Test",
                        super: false
                    });
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.InvalidClassProperty);
            });

/*
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

*/
        });

    });

});
