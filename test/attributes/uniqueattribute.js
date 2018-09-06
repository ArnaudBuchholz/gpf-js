"use strict";

describe("attributes/uniqueattribute", function () {

    describe("gpf.attributes.UniqueAttribute", function () {

        it("can't be used on a non-attribute class", function () {
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

        it("can't be used on a member of an attribute class", function () {
            var exceptionCaught;
            try {
                gpf.define({
                    $class: "Attribute",
                    $extend: gpf.attributes.Attribute,

                    "[test]": [new gpf.attributes.UniqueAttribute()],
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
                    $attributes: [new gpf.attributes.UniqueAttribute()]
                });
                attribute = new Attribute();
            });

            it("fails definition if used twice at class level", function () {
                var exceptionCaught;
                try {
                    gpf.define({
                        $class: "Test",
                        $attributes: [attribute, attribute]
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
                        "[test]": [attribute, attribute],
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
                        $class: "Test",
                        $attributes: [attribute],
                        "[test]": [attribute],
                        test: function () {}
                    });
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(!exceptionCaught);
            });

            describe("using inheritance", function () {

                var BaseClass;

                before(function () {
                    BaseClass = gpf.define({
                        $class: "BaseClass",
                        $attributes: [attribute],
                        "[test]": [attribute],
                        test: function () {}
                    });
                });

                it("fails definition if used twice at class level", function () {
                    var exceptionCaught;
                    try {
                        gpf.define({
                            $class: "Test",
                            $attributes: [attribute],
                            $extend: BaseClass
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
                            $extend: BaseClass,
                            "[test]": [attribute],
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
