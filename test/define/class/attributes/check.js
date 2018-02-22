"use strict";

describe("define/class/attributes/check", function () {

    var MyAttribute = gpf.define({
        $class: "MyAttribute",
        $extend: "gpf.attributes.Attribute",

        _value: undefined,

        getValue: function () {
            return this._value;
        },

        constructor: function (value) {
            this._value = value;
        }

    });

    describe("attributes validation", function () {

        it("allows only existing members", function () {
            var exceptionCaught;
            try {
                gpf.define({
                    $class: "Test1",
                    "[t3st]": [],
                    test: 0
                });
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.UnknownAttributesSpecification);
        });

        it("allows only an array (of attributes) - member", function () {
            var exceptionCaught;
            try {
                gpf.define({
                    $class: "Test1",
                    "[test]": {},
                    test: 0
                });
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.InvalidAttributesSpecification);
        });

        it("allows only an array (of attributes) - class", function () {
            var exceptionCaught;
            try {
                gpf.define({
                    $class: "Test1",
                    $attributes: {},
                    test: 0
                });
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.InvalidAttributesSpecification);
        });

        it("allows only an array of attributes - member", function () {
            var exceptionCaught;
            try {
                gpf.define({
                    $class: "Test1",
                    "[test]": [{}],
                    test: 0
                });
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.InvalidAttributesSpecification);
        });

        it("allows only an array of attributes - class", function () {
            var exceptionCaught;
            try {
                gpf.define({
                    $class: "Test1",
                    $attributes: [{}],
                    test: 0
                });
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.InvalidAttributesSpecification);
        });

    });

    describe("attributes definition", function () {

        it("does not expose new members", function () {
            var MyClassWithAttributes = gpf.define({
                $class: "MyClassWithAttributes",
                $attributes: [new MyAttribute("class")],
                "[test]": [new MyAttribute("member")],
                test: 0
            });

            assert(undefined === MyClassWithAttributes.prototype["[test]"]);
        });

    });

});
