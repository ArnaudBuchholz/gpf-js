"use strict";

/*jshint esversion: 6 */
/*eslint-env es6*/

describe("attributes.es6", function () {

    var baseAttributeContent = {
            $extend: "gpf.attributes.Attribute",
            _value: undefined,
            getValue: function () {
                return this._value;
            },
            constructor: function (value) {
                this._value = value;
            }
        },

        MyAttribute1 = gpf.define(Object.assign({
            $class: "MyAttribute1"
        }, baseAttributeContent)),

        MyAttribute2 = gpf.define(Object.assign({
            $class: "MyAttribute2"
        }, baseAttributeContent)),

        MyClass = gpf.define({
            $class: "MyClass",
            $attributes: [new MyAttribute1("A"), new MyAttribute1("B"), new MyAttribute2("C")],
            "[value]": [new MyAttribute1("D")],
            value: 0
        });

    class MyNativeClass extends MyClass {}

    describe("gpf.attributes.get", function () {

        describe("with native inheritance", function () {

            it("retrieves all attributes (on class)", function () {
                var attributes = gpf.attributes.get(MyNativeClass);
                assert(Object.keys(attributes).length === 2);
                assert(attributes.$attributes.length === 3);
                assert(attributes.value.length === 1);
                assert(attributes.value[0].getValue() === "D");
            });

            it("retrieves all attributes (on instance)", function () {
                var myObject = new MyNativeClass(),
                    attributes = gpf.attributes.get(myObject);
                assert(Object.keys(attributes).length === 2);
                assert(attributes.$attributes.length === 3);
                assert(attributes.value.length === 1);
                assert(attributes.value[0].getValue() === "D");
            });

        });

    });

});
