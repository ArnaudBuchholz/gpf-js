"use strict";

describe("define", function () {

    describe("gpf.define", function () {

        /*global test*/
        gpf.context().test = {};

        var
            A = gpf.define("A", {
                "protected": {
                    _a: 0
                },
                "public": {
                    constructor: function (value) {
                        this._a = value;
                    },
                    a: function () {
                        return this._a;
                    }
                }
            }),

            B = gpf.define("B", A, {
                "private": {
                    _b: 0
                },
                "public": {
                    constructor: function (value) {
                        this._b = value;
                        this._super(value + 1);
                    },
                    b: function () {
                        return this._a + this._b;
                    }
                }
            });

        gpf.define("test.define.C", {});

        describe("validate definitions", function () {

            it("generates constructor functions", function () {
                assert(A instanceof Function);
                assert("A" === A.compatibleName());
                assert(B instanceof Function);
                assert("B" === B.compatibleName());
            });

            it("prevents constructor functions to be used as simple functions", function () {
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

            it("extends namespaces", function () {
                assert(test.define.C instanceof Function);
                assert("C" === test.define.C.compatibleName());
            });

            var visibilities = "public|protected|private|static".split("|"),
                testRadix = "prevents combination of visibilities (";

            visibilities.forEach(function (mainVisibility) {
                visibilities.forEach(function (subVisibility) {

                    it(testRadix + mainVisibility + "/" + subVisibility + ")", function () {
                        var failed,
                            definition = {},
                            main = definition[mainVisibility] = {};
                        main[subVisibility] = {
                            test: 0
                        };
                        try {
                            gpf.define("D", definition);
                        } catch (e) {
                            failed = true;
                            assert(e.code === gpf.Error.CODE_CLASSINVALIDVISIBILITY);
                        }
                        assert(failed);
                    });

                });
            });

        });

        describe("basic inheritance tests", function () {

            var a = new A(1),
                b = new B(1);

            it("handles instanceof", function () {
                assert(a instanceof A);
                assert(!(a instanceof B));
                assert(b instanceof B);
            });

            it("handles inherited instanceof", function () {
                assert(b instanceof A);
            });

            it("exposes method A::a and provides access to A::_a", function () {
                assert(!a.hasOwnProperty("a"));
                assert(a.a() === 1);
            });

            it("provides access to A::_a inside constructor of B", function () {
                assert(!b.hasOwnProperty("a"));
                assert(b.a() === 2);
            });

            it("provides access to A::_a inside B::b", function () {
                assert(!b.hasOwnProperty("b"));
                assert(b.b() === 3);
            });

        });

        describe("advanced inheritance tests", function () {

            var D = gpf.define("D", {
                    "protected": {
                        _dMember: 0
                    },
                    "public": {
                        constructor: function (value) {
                            this._dMember = value;
                        },
                        dMember: function () {
                            return this._dMember;
                        },
                        overriddenMethod: function (value) {
                            return value + 1;
                        }
                    }
                }),
                E = gpf.define("E", D, {
                    "public": {
                        overriddenMethod: function (value) {
                            return this._super(value) + 1;
                        }
                    }
                });

            it("calls super constructor implicitly", function () {
                var e = new E(5);
                assert(e.dMember() === 5);
            });

            it("allows calling super method", function () {
                var e = new E(0);
                assert(e.overriddenMethod(5) === 7);
            });

            it("prevents overloading a member with a different type", function () {
                var caught = false;
                try {
                    gpf.define("F", E, {
                        "public": {
                            overriddenMethod: "forbidden"
                        }
                    });
                } catch (e) {
                    assert(e instanceof gpf.Error);
                    assert(e.code === gpf.Error.CODE_CLASSMEMBEROVERLOADWITHTYPECHANGE);
                    assert(e.code === gpf.Error.classMemberOverloadWithTypeChange.CODE);
                    assert(e.name === "classMemberOverloadWithTypeChange");
                    caught = true;
                }
                assert(true === caught);
            });

        });

        describe("static members", function () {

            var D = gpf.define("D", {
                "static": {
                    test: 1
                }
            });

            it("declares members on the 'class'", function () {
                assert(D.test === 1);
            });

        });

        if (gpf.internals) {

            describe("(internal)", function () {

                describe("_gpfGetClassDefinition", function () {

                    var classDefOfA;

                    before(function () {
                        classDefOfA = gpf.internals._gpfGetClassDefinition(A);
                    });

                    it("provides information on the class defined with gpf.define", function () {
                        assert(undefined !== classDefOfA);
                        // Showing some examples (not relevant for coverage)
                        assert("A" === classDefOfA._name);
                        assert(Object === classDefOfA._Super);
                        assert(1 === classDefOfA._Subs.length);
                    });

                    it("provides information on the instance constructor defined with gpf.define", function () {
                        var a = new A(),
                            classDefOfaConstructor = gpf.internals._gpfGetClassDefinition(a.constructor);
                        assert(undefined !== classDefOfaConstructor);
                        assert(classDefOfA === classDefOfaConstructor);
                    });

                    describe("_gpfGetClassDefinition.addMember", function () {

                        it("allows to add a member dynamically", function () {
                            var a = new A();
                            classDefOfA.addMember("test", "rulez");
                            assert("rulez" === a.test);
                            classDefOfA.addMember("staticTest", "rulez", "static");
                            assert("rulez" === A.staticTest);
                        });

                        it("validates member visibility", function () {
                            var caught = false;
                            try {
                                classDefOfA.addMember("test2", "fails", "anything");
                            } catch (e) {
                                assert(e instanceof gpf.Error);
                                assert(e.code === gpf.Error.CODE_CLASSINVALIDVISIBILITY);
                                assert(e.code === gpf.Error.classInvalidVisibility.CODE);
                                assert(e.name === "classInvalidVisibility");
                                caught = true;
                            }
                            assert(true === caught);
                        });

                    });

                });

            });

        }

    });

});
