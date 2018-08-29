"use strict";

describe("attributes/classattribute", function () {

    describe("gpf.attributes.ClassAttribute", function () {

        it("can't be used on a non-attribute class", function () {
            var exceptionCaught;
            try {
                gpf.define({
                    $class: "B",
                    $attributes: [new gpf.attributes.ClassAttribute()]
                });
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.RestrictedBaseClassAttribute);
        });

        it("can't be used on a member of an attribute class", function () {
            var exceptionCaught;
            try {
                gpf.define({
                    $class: "Attribute",
                    $extend: gpf.attributes.Attribute,

                    "[test]": [new gpf.attributes.ClassAttribute()],
                    test: function () {}
                });
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.ClassAttributeOnly);
        });

        describe("When used properly", function () {

            var Attribute,
                attribute;

            before(function () {
                Attribute = gpf.define({
                    $class: "Attribute",
                    $extend: gpf.attributes.Attribute,
                    $attributes: [new gpf.attributes.ClassAttribute()]
                });
                attribute = new Attribute();
            });

            it("fails definition if used at member level", function () {
                var exceptionCaught;
                try {
                    gpf.define({
                        $class: "Test",
                        "[test]": [attribute],
                        test: function () {}
                    });
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.ClassAttributeOnly);
            });

            it("accepts definition if used at class level", function () {
                var exceptionCaught;
                try {
                    gpf.define({
                        $class: "Test",
                        $attributes: [attribute]
                    });
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(!exceptionCaught);
            });

        });
    });

});
