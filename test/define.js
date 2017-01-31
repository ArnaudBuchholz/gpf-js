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

                [
                    "A",
                    "$B",
                    "_C",
                    "Test123"
                ].forEach(function (validClassName) {
                    it("validates class name (" + validClassName + ")", function () {
                        var exceptionCaught;
                        try {
                            gpf.define({
                                $class: validClassName
                            });
                        } catch (e) {
                            exceptionCaught = e;
                        }
                        assert(undefined === exceptionCaught);
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
                    assert(exceptionCaught instanceof gpf.Error.InvalidEntity$Property);
                });

                it("rejects invalid property names (reserved keywords)", function () {
                    var exceptionCaught;
                    try {
                        gpf.define({
                            $class: "Test",
                            "super": false
                        });
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.InvalidClassProperty);
                });

            });

        });

        describe("Definition", function () {

            var A, a;

            before(function () {
                A = gpf.define({
                    $class: "A",
                    _member: "defaultValue",
                    getMember: function () {
                        return this._member;
                    }
                });

                a = new A();
            });

            it("prevents constructor functions to be used without new", function () {
                var exceptionCaught;
                try {
                    A(); // eslint-disable-line new-cap
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.ClassConstructorFunction);
            });

            it("handles instanceof", function () {
                assert(a instanceof A);
            });

            it("exposes methods", function () {
                assert("function" === typeof a.getMember);
                assert("defaultValue" === a.getMember());
            });

            describe("Subclassing", function () {

                var B, b;

                before(function () {
                    B = gpf.define({
                        $class: "B",
                        $extend: A,
                        "constructor": function () {
                            this._member = "valueOfB";
                        },
                        setMember: function (newValue) {
                            this._member = newValue;
                        }
                    });

                    b = new B();
                });

                it("handles instanceof", function () {
                    assert(b instanceof A);
                    assert(b instanceof B);
                });

                it("calls the constructor function", function () {
                    assert(b.getMember() === "valueOfB");
                });

            });

        });

    });

});
