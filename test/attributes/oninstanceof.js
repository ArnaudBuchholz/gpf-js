"use strict";

describe("attributes/oninstanceof", function () {

    describe("gpf.attributes.OnInstanceOf", function () {

        var A,
            onInstanceOfA;

        before(function () {
            A = gpf.define({
                $class: "A",
                $abstract: true
            });
            onInstanceOfA = new gpf.attributes.OnInstanceOf(A);
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
            assert(exceptionCaught);
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
            assert(exceptionCaught);
        });

        describe("When used properly", function () {

            var AttributeForA;

            before(function () {
                AttributeForA = gpf.define({
                    $class: "AttributeForA",
                    $extend: gpf.attributes.Attribute,
                    $attributes: [onInstanceOfA]
                });
            });

            it("fails definition if used on the wrong class", function () {
                var exceptionCaught;
                try {
                    gpf.define({
                        $class: "NotAChildOfA",
                        $attributes: [AttributeForA]
                    })
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught);
            });

            it("accepts definition if used on direct child class", function () {
                var exceptionCaught;
                try {
                    gpf.define({
                        $class: "DirectChildOfA",
                        $extend: A,
                        $attributes: [AttributeForA]
                    })
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
                            $attributes: [AttributeForA]
                        }),
                        SubChildOfA = gpf.define({
                            $class: "SubChildOfA",
                            $extend: DirectChildOfA,
                            $attributes: [AttributeForA]
                        })
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(!exceptionCaught);
            });

        });
    });


});
