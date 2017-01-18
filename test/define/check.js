"use strict";

describe("define/checkDefinition", function () {

    if (gpf.internals) {

        describe("(internal) _GpfEntityDefinition", function () {

            var _GpfEntityDefinition = gpf.internals._GpfEntityDefinition,
                _gpfDefineBuildTypedEntity = gpf.internals._gpfDefineBuildTypedEntity;

            it("looks for an entity type", function () {
                var exceptionCaught;
                try {
                    _gpfDefineBuildTypedEntity({});
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.InvalidEntityType);
            });

            it("converts $class into _type and _name", function () {
                var definition = _gpfDefineBuildTypedEntity({
                    $class: "Test"
                });
                assert(definition instanceof _GpfEntityDefinition);
                definition.check();
                assert("class" === definition._type);
                assert("Test" === definition._name);
            });

            it("converts $class into _type, _name and _namespace (absolute)", function () {
                var definition = _gpfDefineBuildTypedEntity({
                    $class: "gpf.test.Test"
                });
                definition.check();
                assert("class" === definition._type);
                assert("Test" === definition._name);
                assert("gpf.test" === definition._namespace);
            });

            it("converts $class into _type, _name and _namespace (relative)", function () {
                var definition = _gpfDefineBuildTypedEntity({
                    $class: "test.Test",
                    $namespace: "gpf"
                });
                definition.check();
                assert("class" === definition._type);
                assert("Test" === definition._name);
                assert("gpf.test" === definition._namespace);
            });

            it("prioritize $class over $name", function () {
                var definition = _gpfDefineBuildTypedEntity({
                    $class: "Test",
                    $name: "Any"
                });
                definition.check();
                assert("class" === definition._type);
                assert("Test" === definition._name);
            });

            it("validates namespace", function () {
                _gpfDefineBuildTypedEntity({
                    $class: "Test",
                    $namespace: "lowerCamelCase.$accepted._also.numbers456"
                }).check();
                _gpfDefineBuildTypedEntity({
                    $class: "Test",
                    $namespace: "simple"
                }).check();
                _gpfDefineBuildTypedEntity({
                    $class: "Test",
                    $namespace: ""
                }).check();
            });

            [
                "endingPointIsNotOK.",
                "startingNumberIsNotOK.4test",
                "$isOKOnlyAtBeginning.test$",
                "_isOKOnlyAtBeginning.test_",
                "CapitalFirstLetterIsNotOK"
            ].forEach(function (invalidNamespace) {
                it("rejects invalid namespace (" + invalidNamespace + ")", function () {
                    var exceptionCaught;
                    try {
                        _gpfDefineBuildTypedEntity({
                            $class: "Test",
                            $namespace: invalidNamespace
                        }).check();
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.InvalidEntityNamespace);
                });

            });

        });

    }

});
