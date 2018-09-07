"use strict";

describe("attributes/uniqueattribute", function () {

    describe("gpf.attributes.UniqueAttribute", function () {

        it("can't be used on a non-unique class", function () {
            var exceptionCaught;
            try {
                gpf.define({
                    $class: "Any",
                    $attributes: [new gpf.attributes.UniqueAttribute()]
                });
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.RestrictedBaseClassAttribute);
        });

        it("can't be used on a member of an unique class", function () {
            var exceptionCaught;
            try {
                gpf.define({
                    $class: "UniqueAttribute",
                    $extend: gpf.attributes.UniqueAttribute,
                    "[test]": [new gpf.attributes.UniqueAttribute()],
                    test: function () {}
                });
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.ClassAttributeOnly);
        });

        describe("When used properly", function () {

            var unique,
                any;

            before(function () {
                var AttributeThatShouldBeUnique = gpf.define({
                        $class: "AttributeThatShouldBeUnique",
                        $extend: gpf.attributes.Attribute,
                        $attributes: [new gpf.attributes.UniqueAttribute()]
                    }),
                    AnyAttribute = gpf.define({
                        $class: "AnyAttribute",
                        $extend: gpf.attributes.Attribute
                    });
                unique = new AttributeThatShouldBeUnique();
                any = new AnyAttribute();
            });

            it("fails definition if used twice at class level", function () {
                var exceptionCaught;
                try {
                    gpf.define({
                        $class: "TestAttribute",
                        $extend: gpf.attributes.Attribute,
                        $attributes: [any, unique, unique]
                    });
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.UniqueAttributeUsedTwice);
            });

            it("fails definition if used twice at member level", function () {
                var exceptionCaught;
                try {
                    gpf.define({
                        $class: "TestAttribute",
                        $extend: gpf.attributes.Attribute,
                        "[test]": [any, unique, unique],
                        test: function () {}
                    });
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.UniqueAttributeUsedTwice);
            });

            it("accepts definition if used once at any level", function () {
                var exceptionCaught;
                try {
                    gpf.define({
                        $class: "TestAttribute",
                        $extend: gpf.attributes.Attribute,
                        $attributes: [any, unique],
                        "[test]": [any, unique],
                        test: function () {}
                    });
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(!exceptionCaught);
            });

            describe("using inheritance", function () {

                var BaseTestAttribute;

                before(function () {
                    BaseTestAttribute = gpf.define({
                        $class: "BaseTestAttribute",
                        $extend: gpf.attributes.Attribute,
                        $attributes: [any, unique],
                        "[test]": [any, unique],
                        test: function () {}
                    });
                });

                it("fails definition if used twice at class level", function () {
                    var exceptionCaught;
                    try {
                        gpf.define({
                            $class: "Test",
                            $attributes: [unique],
                            $extend: BaseTestAttribute
                        });
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.UniqueAttributeUsedTwice);
                });

                it("fails definition if used twice at member level", function () {
                    var exceptionCaught;
                    try {
                        gpf.define({
                            $class: "Test",
                            $extend: BaseTestAttribute,
                            "[test]": [unique],
                            test: function () {}
                        });
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.UniqueAttributeUsedTwice);
                });

            });

        });
    });

});
