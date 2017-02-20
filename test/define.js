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
                    },
                    funcWith3params: function (p1, p2, p3) {
                        return p1 + p2 + p3;
                    },
                    throwError: function () {
                        throw new Error("error");
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

            it("creates a constructor with the same signature than the constructor property", function () {
                assert(A.length === 1);
            });

            it("handles instanceof", function () {
                assert(a instanceof A);
            });

            it("calls constructor property", function () {
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
                        },
                        baseTest: function () {
                            return this.$super.getMember();
                        },
                        invalidSuperMember: function () {
                            return this.$super.doesntExist();
                        },
                        noSuperMember: function () {
                            return this.$super();
                        },
                        differentBinding: function () {
                            return this.$super.getMember.call({
                                _member: "different"
                            });
                        },
                        checkSignature: function () {
                            assert(this.$super.funcWith3params.length === 3);
                        },
                        throwError: function () {
                            this.$super();
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

                it("offers a way to call named base method", function () {
                    assert(b.baseTest() === "valueOfB");
                });

                it("fails when accessing an unknown $super member", function () {
                    var exceptionCaught;
                    try {
                        b.invalidSuperMember();
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.InvalidClassSuperMember);
                });

                it("fails when accessing inexistent $super", function () {
                    var exceptionCaught;
                    try {
                        b.noSuperMember();
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.InvalidClassSuper);
                });

                it("allows calling $super member with a different binding", function () {
                    assert(b.differentBinding() === "different");
                });

                it("respects methods signature", function () {
                    b.checkSignature();
                });

                it("does not leak $super", function () {
                    assert(undefined === b.$super);
                });

                it("does not leak $super on exception", function () {
                    try {
                        b.throwError();
                    } catch (e) {
                        // ignore
                    }
                    assert(undefined === b.$super);
                });

                it("handles several versions of $super", function () {
                    var C = gpf.define({
                            $class: "C",
                            $extend: B,
                            testMethod: function () {
                                return this.$super.getMember();
                            }
                        }),
                        c = new C();
                    assert("valueOfB-inB" === c.testMethod());
                });
            });

        });

    });

});
