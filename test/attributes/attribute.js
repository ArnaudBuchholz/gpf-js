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
            attribute,
            classAttribute,
            memberAttribute;

        before(function () {
            MyAttribute = gpf.define({
                $class: "MyAttribute",
                $extend: gpf.attributes.Attribute
            });
            attribute = new MyAttribute();
            classAttribute = new MyAttribute();
            memberAttribute = new MyAttribute();
            MyClassWithAttributes = gpf.define({
                $class: "MyClassWithAttributes",
                $attributes: [classAttribute],
                "[member]": [memberAttribute],
                member: "Hello World"
            });
        });

        it("does not provide any information when not used", function () {
            assert(attribute.getClassConstructor() === undefined);
            assert(attribute.getMemberName() === undefined);
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

    describe("$singleton usage", function () {

        var MyAttribute,
            classAttribute,
            memberAttribute;

        before(function () {
            MyAttribute = gpf.define({
                $class: "MyAttribute",
                $extend: gpf.attributes.Attribute,
                $singleton: true
            });
            classAttribute = new MyAttribute();
            memberAttribute = new MyAttribute();
            gpf.define({
                $class: "MyClassWithAttributes",
                $attributes: [classAttribute],
                "[member]": [memberAttribute],
                member: "Hello World"
            });
        });

        it("does not provide class constructor information", function () {
            assert(classAttribute.getClassConstructor() === undefined);
            assert(memberAttribute.getClassConstructor() === undefined);
        });

        it("does not provide member name information", function () {
            assert(classAttribute.getMemberName() === undefined);
            assert(memberAttribute.getMemberName() === undefined);
        });

    });

});
