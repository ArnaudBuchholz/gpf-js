"use strict";

describe("attributes", function () {

    var baseContent = {
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
        }, baseContent)),

        MyAttribute2 = gpf.define(Object.assign({
            $class: "MyAttribute2"
        }, baseContent)),

        MyClassWithoutAttributes = gpf.define({
            $class: "MyClassWithoutAttributes"
        }),

        MyClass = gpf.define({
            $class: "MyClass",
            $attributes: [new MyAttribute1("A"), new MyAttribute1("B"), new MyAttribute2("C")],
            "[value]": [new MyAttribute1("D")],
            value: 0
        }),

        MySubClass = gpf.define({
            $class: "MyClass",
            $extend: MyClass,
            $attributes: [new MyAttribute1("E"), new MyAttribute2("F")],
            "[value]": [new MyAttribute2("G")],
            "[value2]": [new MyAttribute1("H")],
            value2: 1
        });

    describe("gpf.attributes.get", function () {

        it("returns an empty object if the class was not allocated by gpf.define", function () {
            var attributes = gpf.attributes.get(String);
            assert(Object.keys(attributes).length === 0);
        });

        it("returns an empty object if no attributes", function () {
            var attributes = gpf.attributes.get(MyClassWithoutAttributes);
            assert(Object.keys(attributes).length === 0);
        });

        it("retrieves all attributes (on class)", function () {
            var attributes = gpf.attributes.get(MyClass);
            assert(Object.keys(attributes).length === 2);
            assert(attributes.$attributes.length === 3);
            assert(attributes.value.length === 1);
            assert(attributes.value[0].getValue() === "D");
        });

        it("retrieves all attributes (on instance)", function () {
            var myObject = new MyClass(),
                attributes = gpf.attributes.get(myObject);
            assert(Object.keys(attributes).length === 2);
            assert(attributes.$attributes.length === 3);
            assert(attributes.value.length === 1);
            assert(attributes.value[0].getValue() === "D");
        });

        it("filters on a given attribute class", function () {
            var attributes = gpf.attributes.get(MyClass, MyAttribute2);
            assert(Object.keys(attributes).length === 1);
            assert(attributes.$attributes.length === 1);
            assert(attributes.$attributes[0].getValue() === "C");
        });

        describe("with inheritance", function () {

            it("retrieves all attributes (on class)", function () {
                var attributes = gpf.attributes.get(MySubClass);
                assert(Object.keys(attributes).length === 3);
                assert(attributes.$attributes.length === 5);
                assert(attributes.value.length === 2);
                assert(attributes.value2[0].getValue() === "H");
            });

            it("filters on a given attribute class", function () {
                var attributes = gpf.attributes.get(MySubClass, MyAttribute1);
                assert(Object.keys(attributes).length === 3);
                assert(attributes.$attributes.length === 3);
                assert(attributes.value2[0].getValue() === "H");
            });

        });

    });

});
