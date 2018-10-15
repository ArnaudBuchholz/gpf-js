"use strict";

describe("attributes/attribute", function () {

    it("is abstract", function () {
        var exceptionCaught;
        try {
            var instance = new gpf.attributes.Attribute();
            throw new Error(instance.toString());
        } catch (e) {
            exceptionCaught = e;
        }
        assert(exceptionCaught instanceof gpf.Error.AbstractClass);
    });

    describe("basic usage", function () {

        var MyAttribute,
            MyClassWithAttributes,
            classAttribute,
            memberAttribute;

        before(function () {
            MyAttribute = gpf.define({
                $class: "MyAttribute",
                $extend: gpf.attributes.Attribute
            });
            classAttribute = new MyAttribute();
            memberAttribute = new MyAttribute();
            MyClassWithAttributes = gpf.define({
                $class: "MyClassWithAttributes",
                $attributes: [classAttribute],
                "[member]": [memberAttribute],
                member: "Hello World"
            });
        });

        it("provides class constructor information", function () {
            assert(classAttribute.getClassConstructor() === MyClassWithAttributes);
            assert(memberAttribute.getClassConstructor() === MyClassWithAttributes);
        });

        it("provides member name information", function () {
            assert(classAttribute.getMemberName() === undefined);
            assert(memberAttribute.getMemberName() === "member");
        });

    });

});
