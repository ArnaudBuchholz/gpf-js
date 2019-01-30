"use strict";

describe("define/class/singleton", function () {

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
                it("supports only $singleton = true (" + JSON.stringify(invalidValue) + ")", function () {
                    var exceptionCaught;
                    try {
                        _gpfDefineBuildTypedEntity({
                            $type: "class",
                            $name: "Test",
                            $singleton: invalidValue
                        });
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.InvalidClass$SingletonSpecification);
                });
            });
        });

    }

    describe("$singleton", function () {

        var A,
            baseDefinition = {
                _unique: null,
                getUniqueObject: function () {
                    return this._unique;
                },
                "constructor": function () {
                    this._unique = {};
                }
            };

        before(function () {
            A = gpf.define(Object.assign({
                $class: "A",
                $singleton: true
            }, baseDefinition));
        });

        it("allows only one instantation of the class", function () {
            var a0 = new A(),
                unique = a0.getUniqueObject(),
                a1 = new A();
            assert(a0 === a1);
            assert(unique === a1.getUniqueObject());
        });

        describe("in a sub class", function () {

            var B, C;

            before(function () {
                B = gpf.define(Object.assign({
                    $class: "B"
                }, baseDefinition));
                C = gpf.define({
                    $class: "C",
                    $extend: B,
                    $singleton: true
                });
            });

            it("does not alter base class behavior", function () {
                var b0 = new B(),
                    c0 = new C(),
                    unique = c0.getUniqueObject(),
                    b1 = new B(),
                    c1 = new C();
                assert(b0 !== b1);
                assert(b0.getUniqueObject() !== b1.getUniqueObject());
                assert(c0 === c1);
                assert(unique === c1.getUniqueObject());
            });

        });

    });

});

if (config.features.es6class) {

    include("define/class/singleton.es6");

}
