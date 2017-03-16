"use strict";

describe("interfaces", function () {

    describe("gpf.interfaces.IUnknown", function () {

        it("exists", function () {
            assert("function" === typeof gpf.interfaces.IUnknown);
        });

        it("is an interface", function () {
            var exceptionCaught;
            try {
                var instance = new gpf.interfaces.IUnknown();
                assert(instance);
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

        it("rejects member if not a method", function () {
            assert(false === gpf.interfaces.isImplementedBy("gpf.interfaces.IUnknown", {
                queryInterface: "Not a method"
            }));
        });

    });

});
