"use strict";

describe("attributes/attributeforinstanceof", function () {

    describe("gpf.attributes.AttributeForInstanceOf", function () {

        var A,
            onInstanceOfA;

        before(function () {
            A = gpf.define({
                $class: "A",
                $abstract: true
            });
            onInstanceOfA = new gpf.attributes.AttributeForInstanceOf(A);
        });

        it("can't be used on a non-attribute class", function () {
            var exceptionCaught;
            try {
                gpf.define({
                    $class: "B",
                    $attributes: [onInstanceOfA]
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

                    "[test]": [onInstanceOfA],
                    test: function () {}
                });
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.ClassAttributeOnly);
        });

        describe("When used properly", function () {

            var AttributeForA,
                attributeForA;

            before(function () {
                AttributeForA = gpf.define({
                    $class: "AttributeForA",
                    $extend: gpf.attributes.Attribute,
                    $attributes: [onInstanceOfA]
                });
                attributeForA = new AttributeForA();
            });

            it("fails definition if used on the wrong class", function () {
                var exceptionCaught;
                try {
                    gpf.define({
                        $class: "NotAChildOfA",
                        $attributes: [attributeForA]
                    });
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.RestrictedBaseClassAttribute);
            });

            it("accepts definition if used on direct child class", function () {
                var exceptionCaught;
                try {
                    gpf.define({
                        $class: "DirectChildOfA",
                        $extend: A,
                        $attributes: [attributeForA]
                    });
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(!exceptionCaught);
            });

            it("accepts definition if used on child class", function () {
                var exceptionCaught;
                try {
                    var DirectChildOfA = gpf.define({
                        $class: "DirectChildOfA",
                        $extend: A,
                        $attributes: [attributeForA]
                    });
                    gpf.define({
                        $class: "SubChildOfA",
                        $extend: DirectChildOfA,
                        $attributes: [attributeForA]
                    });
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(!exceptionCaught);
            });

        });
    });

});