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

    function _generateNamesValidation (typeName, Exception, names) {

        Object.keys(names).filter(function (name) {
            return !names[name];
        }).forEach(function (invalidName) {
            it("rejects invalid " + typeName + " name (" + invalidName + ")", function () {
                var exceptionCaught,
                    definition = {};
                definition["$" + typeName] = invalidName;
                try {
                    gpf.define(definition);
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof Exception);
            });
        });

        Object.keys(names).filter(function (name) {
            return names[name];
        }).forEach(function (validName) {
            it("accepts valid " + typeName + " name (" + validName + ")", function () {
                var exceptionCaught,
                    definition = {};
                definition["$" + typeName] = validName;
                try {
                    gpf.define(definition);
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(undefined === exceptionCaught);
            });
        });

    }

    function _generateBasicValidations (descriptor) {
        it(descriptor.it, function () {
            var exceptionCaught;
            try {
                gpf.define(descriptor.definition);
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof descriptor.exception);
        });
    }

    describe("gpf.define", function () {

        it("accepts only one parameter", function () {
            assert("function" === typeof gpf.define);
            assert(1 === gpf.define.length);
        });

        describe("Common validation", function () {

            _generateBasicValidations({
                it: "checks that the entity type is specified",
                definition: {},
                exception: gpf.Error.InvalidEntityType
            });

        });

        describe("Class definition", function () {

            describe("Validation", function () {

                _generateNamesValidation("class", gpf.Error.InvalidClassName, {
                    "1NumberAtTheBeginningIsNotOK": false,
                    "noUppercaseFirstLetterIsNotOK": false,
                    "DollarSignAnywhereIsNotOK$": false,
                    "A": true,
                    "$B": true,
                    "_C": true,
                    "Test123": true
                });

                [{
                    it: "rejects invalid $ property names",
                    definition: {
                        $class: "Test",
                        $test: false
                    },
                    exception: gpf.Error.InvalidEntity$Property

                }, {
                    it: "rejects invalid property names (reserved keywords)",
                    definition: {
                        $class: "Test",
                        "super": false
                    },
                    exception: gpf.Error.InvalidClassProperty

                }, {
                    it: "rejects constructor property if not a method",
                    definition: {
                        $class: "Test",
                        constructor: false
                    },
                    exception: gpf.Error.InvalidClassConstructor

                }].forEach(_generateBasicValidations);

            });

            describe("Implementation", function () {

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

            function describe_ () {
                /* Until the implementation is working */
            }

            describe_("$abstract", function () {

                var A, B, C;

                before(function () {

                    A = gpf.define({
                        $class: "A",
                        $abstract: true,
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

                    B = gpf.define({
                        $class: "B",
                        $extend: A
                    });

                    C = gpf.define({
                        $class: "C",
                        $extend: B,
                        $abstract: true
                    });

                });

                function _noInstantiation (AbstractClass) {
                    it("prevents instantiation of abstract class ("
                        + AbstractClass.compatibleName() + ")", function () {
                        var exceptionCaught;
                        try {
                            var instance = new AbstractClass();
                            assert(!instance);
                        } catch (e) {
                            exceptionCaught = e;
                        }
                        assert(exceptionCaught instanceof gpf.Error.AbstractClass);
                    });
                }

                _noInstantiation(A);

                it("enables instantiation on subclass (B)", function () {
                    var b = new B();
                    assert(b);
                });

                _noInstantiation(C);

            });

        });

        describe("Interface definition", function () {

            describe("Validation", function () {

                _generateNamesValidation("interface", gpf.Error.InvalidInterfaceName, {
                    "1NumberAtTheBeginningIsNotOK": false,
                    "noUppercaseFirstLetterIsNotOK": false,
                    "DollarSignAnywhereIsNotOK$": false,
                    "NotStartingWithUppercaseI": false,
                    "A": false,
                    "$B": false,
                    "_C": false,
                    "Test123": false,
                    "ISample": true,
                    "IS": true
                });

                [{
                    it: "rejects interface if all members are not methods",
                    definition: {
                        $interface: "ITest",
                        member: false
                    },
                    exception: gpf.Error.InvalidInterfaceProperty

                }, {
                    it: "rejects invalid property names (reserved keywords)",
                    definition: {
                        $interface: "ITest",
                        "super": function () {
                        }
                    },
                    exception: gpf.Error.InvalidInterfaceProperty

                }, {
                    it: "rejects constructor property",
                    definition: {
                        $interface: "ITest",
                        constructor: function () {
                        }
                    },
                    exception: gpf.Error.InvalidInterfaceProperty

                }].forEach(_generateBasicValidations);

            });

            describe("Implementation", function () {

                var ITest = gpf.define({
                    $interface: "ITest",
                    test: function (value) {
                        return value;
                    }
                });

                it("can't be used as a class extend", function () {
                    var exceptionCaught;
                    try {
                        gpf.define({
                            $class: "Test",
                            $extend: ITest
                        });
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.InvalidClassExtend);
                });

            });

        });

    });

});
