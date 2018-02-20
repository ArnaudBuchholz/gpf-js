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

        MyClass = gpf.define({
            $class: "MyClass",
            $attributes: [new MyAttribute1("g10"), new MyAttribute1("g11"), new MyAttribute2("g22")]

        });

    describe("gpf.attributes.get", function () {

        it("retrieves all attributes", function () {
            var result = gpf.attributes.get(MyClass);
            assert(result.$attributes.length === 3);
        });

    });

});
