"use strict";

describe("define/class/abstract", function () {

    if (gpf.internals) {

        describe("(internal) _GpfClassDefinition", function () {

            var _gpfDefineBuildTypedEntity = gpf.internals._gpfDefineBuildTypedEntity;

            [
                undefined,
                false,
                0,
                "",
                {},
                1,
                "Hello World!"

            ].forEach(function (invalidValue) {
                it("supports only $abstract = true (" + JSON.stringify(invalidValue) + ")", function () {
                    var exceptionCaught;
                    try {
                        _gpfDefineBuildTypedEntity({
                            $type: "class",
                            $name: "Test",
                            $abstract: invalidValue
                        });
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.InvalidClass$AbstractSpecification);
                });
            });
        });

    }

    describe("$abstract", function () {

        var A, B, C;

        before(function () {

            A = gpf.define({
                $class: "A",
                $abstract: true,
                _member: "defaultValue",
                getMember: function () {
                    return this._member;
                },
                "constructor": function (memberValue) {
                    if (memberValue) {
                        this._member = memberValue;
                    }
                    this._constructorOfA = true;
                }
            });

            B = gpf.define({
                $class: "B",
                $extend: A
            });

            C = gpf.define({
                $class: "C",
                $extend: B,
                $abstract: true
            });

        });

        function _noInstantiation (AbstractClass) {
            var exceptionCaught;
            try {
                var instance = new AbstractClass();
                throw new Error(instance.toString());
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.AbstractClass);
        }

        it("prevents instantiation of abstract class (A)", function () {
            _noInstantiation(A);
        });

        it("enables instantiation on subclass (B)", function () {
            var b = new B();
            assert(b.getMember() === "defaultValue");
        });

        it("prevents instantiation of abstract class (C)", function () {
            _noInstantiation(C);
        });

    });

});
