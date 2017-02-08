"use strict";

describe("define", function () {

    var test = {};

    before(function () {
        // Defines a namespace root
        gpf.context().test = test;
    });

    after(function () {
        delete gpf.context().test;
    });

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

                it("rejects constructor property if not a method", function () {
                    var exceptionCaught;
                    try {
                        gpf.define({
                            $class: "Test",
                            constructor: false
                        });
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.InvalidClassConstructor);
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
                    },
                    "constructor": function (memberValue) {
                        if (memberValue) {
                            this._member = memberValue;
                        }
                        this._constructorOfA = true;
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

            it("calls constructor function", function () {
                assert(a._constructorOfA);
            });

            it("exposes methods", function () {
                assert("function" === typeof a.getMember);
                assert("defaultValue" === a.getMember());
            });

            describe("Subclassing", function () {

                it("prevents invalid override", function () {
                    var exceptionCaught;
                    try {
                        gpf.define({
                            $class: "Test",
                            $extend: A,
                            getMember: false
                        });
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.InvalidClassOverride);
                });

                var B, b;

                before(function () {
                    B = gpf.define({
                        $class: "test.B",
                        $extend: A,
                        "constructor": function (initialValue) {
                            this.$super("valueOfB");
                            this._constructorOfB = initialValue;
                        },
                        getMember: function () {
                            return this.$super() + "-inB";
                        },
                        setMember: function (newValue) {
                            this._member = newValue;
                        }
                    });

                    b = new B(3475);
                });

                it("handles instanceof", function () {
                    assert(b instanceof A);
                    assert(b instanceof B);
                });

                it("handles namespace", function () {
                    assert(test.B === B);
                });

                it("calls the constructor function", function () {
                    assert(b._constructorOfB === 3475);
                });

                it("calls the proper $super()", function () {
                    assert(b._constructorOfA);
                    assert(b.getMember() === "valueOfB-inB");
                });
            });

        });

    });

});
