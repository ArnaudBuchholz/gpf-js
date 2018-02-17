"use strict";

describe("interfaces", function () {

    function _ignore () {}

    describe("gpf.interfaces.IUnknown", function () {

        it("exists", function () {
            assert("function" === typeof gpf.interfaces.IUnknown);
        });

        it("is an interface", function () {
            var exceptionCaught;
            try {
                var instance = new gpf.interfaces.IUnknown();
                assert("function" === typeof instance.queryInterface);
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.InterfaceConstructorFunction);
        });

    });

    describe("gpf.interfaces.isImplementedBy", function () {

        function TestRawClass () {}
        TestRawClass.prototype = {
            queryInterface: function (oneParameter) {
                return oneParameter;
            }
        };

        var TestGPFClass = gpf.define({
            $class: "TestGPFClass",
            queryInterface: function (oneParameter) {
                return oneParameter;
            }
        });

        it("validates literal objects (using interface constructor)", function () {
            assert(true === gpf.interfaces.isImplementedBy(gpf.interfaces.IUnknown, {
                queryInterface: function (oneParameter) {
                    return oneParameter;
                }
            }));
        });

        it("validates instances from a raw JavaScript class (using interface name)", function () {
            var obj = new TestRawClass();
            assert(true === gpf.interfaces.isImplementedBy("gpf.interfaces.IUnknown", obj));
        });

        it("validates a raw JavaScript class", function () {
            assert(true === gpf.interfaces.isImplementedBy("gpf.interfaces.IUnknown", TestRawClass));
        });

        it("validates instances from a GPF class", function () {
            var obj = new TestGPFClass();
            assert(true === gpf.interfaces.isImplementedBy(gpf.interfaces.IUnknown, obj));
        });

        it("validates a GPF class", function () {
            assert(true === gpf.interfaces.isImplementedBy(gpf.interfaces.IUnknown, TestGPFClass));
        });

        [false, null, undefined, 0, NaN, ""].forEach(function (falsyValue) {
            it("rejects " + JSON.stringify(falsyValue), function () {
                assert(false === gpf.interfaces.isImplementedBy("gpf.interfaces.IUnknown", falsyValue));
            });
        });

        it("rejects member if not a method", function () {
            assert(false === gpf.interfaces.isImplementedBy("gpf.interfaces.IUnknown", {
                queryInterface: "Not a method"
            }));
        });

        it("rejects member if parameters count does not match (none)", function () {
            assert(false === gpf.interfaces.isImplementedBy("gpf.interfaces.IUnknown", {
                queryInterface: function () {}
            }));
        });

        it("rejects member if parameters count does not match (more)", function () {
            assert(false === gpf.interfaces.isImplementedBy(gpf.interfaces.IUnknown, {
                queryInterface: function (a, b, c) {
                    return a + b + c;
                }
            }));
        });

    });

    describe("gpf.interfaces.query", function () {

        function ITest () {}
        ITest.prototype.test = function (a, b) {
            return a + b;
        };

        it("returns the object if it implements the interface (using interface name)", function () {
            var obj = {
                queryInterface: function (oneParameter) {
                    return oneParameter;
                }
            };
            assert(obj === gpf.interfaces.query("gpf.interfaces.IUnknown", obj));
        });

        it("returns the object if it implements the interface (using interface specifier)", function () {
            var obj = {
                test: function (a, b) {
                    _ignore(a, b);
                }
            };
            assert(obj === gpf.interfaces.query(ITest, obj));
        });

        it("returns null if IUnknown is implemented but not the expected interface", function () {
            assert(null === gpf.interfaces.query(ITest, {
                queryInterface: function (oneParameter) {
                    _ignore(oneParameter);
                    return null; // Because this is the expected interface
                }
            }));
        });

        it("uses IUnknown to get the expected interface", function () {
            assert(null !== gpf.interfaces.query(ITest, {
                queryInterface: function (interfaceSpecifier) {
                    assert(interfaceSpecifier === ITest);
                    return {
                        test: function (a, b) {
                            _ignore(a, b);
                        }
                    };
                }
            }));
        });

        it("returns undefined if neither the expected interface or IUnknown are implemented", function () {
            assert(undefined === gpf.interfaces.query(ITest, {
                queryInterface: function () { // Not matching IUnknown
                    return null;
                }
            }));
        });

    });

});
