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

        var A;

        before(function () {
            A = gpf.define({
                $class: "A",
                $singleton: true,
                _created: null,
                getAllocatedTime: function () {
                    return this._created;
                },
                "constructor": function () {
                    this._created = new Date();
                }
            });
        });

        it("allows only one instantation of the class", function () {
            var a0 = new A(),
                a1 = new A();
            assert(a0 === a1);
            assert(a0.getAllocatedTime() === a1.getAllocatedTime());
        });

    });

});
