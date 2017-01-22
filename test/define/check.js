"use strict";

describe("define/check", function () {

    if (gpf.internals) {

        describe("(internal) _GpfEntityDefinition", function () {

            var _GpfEntityDefinition = gpf.internals._GpfEntityDefinition,
                _gpfDefineBuildTypedEntity = gpf.internals._gpfDefineBuildTypedEntity;

            it("must have an entity type", function () {
                var exceptionCaught;
                try {
                    _gpfDefineBuildTypedEntity({});
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.InvalidEntityType);
            });

            it("checks for a valid name", function () {
                var exceptionCaught;
                try {
                    _gpfDefineBuildTypedEntity({
                        $type: "class"
                    });
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.MissingEntityName);
            });

            it("validates minimal requirement (type and name)", function () {
                _gpfDefineBuildTypedEntity({
                    $type: "class",
                    $name: "Test"
                });
            });

            it("rejects invalid properties", function () {
                var exceptionCaught;
                try {
                    _gpfDefineBuildTypedEntity({
                        $type: "class",
                        $name: "Test",
                        $fail: true
                    });
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.InvalidEntity$Property);
            });

            it("converts $class into _type and _name", function () {
                var definition = _gpfDefineBuildTypedEntity({
                    $class: "Test"
                });
                assert(definition instanceof _GpfEntityDefinition);
                assert("class" === definition._type);
                assert("Test" === definition._name);
            });

            it("converts $class into _type, _name and _namespace (absolute)", function () {
                var definition = _gpfDefineBuildTypedEntity({
                    $class: "gpf.test.Test"
                });
                assert("class" === definition._type);
                assert("Test" === definition._name);
                assert("gpf.test" === definition._namespace);
            });

            it("converts $class into _type, _name and _namespace (relative)", function () {
                var definition = _gpfDefineBuildTypedEntity({
                    $class: "test.Test",
                    $namespace: "gpf"
                });
                assert("class" === definition._type);
                assert("Test" === definition._name);
                assert("gpf.test" === definition._namespace);
            });

            it("prioritize $class over $name", function () {
                var definition = _gpfDefineBuildTypedEntity({
                    $class: "Test",
                    $name: "Any"
                });
                assert("class" === definition._type);
                assert("Test" === definition._name);
            });

            it("validates namespace", function () {
                _gpfDefineBuildTypedEntity({
                    $class: "Test",
                    $namespace: "lowerCamelCase.$accepted._also.numbers456"
                });
                _gpfDefineBuildTypedEntity({
                    $class: "Test",
                    $namespace: "simple"
                });
                _gpfDefineBuildTypedEntity({
                    $class: "Test",
                    $namespace: ""
                });
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
                        });
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.InvalidEntityNamespace);
                });

            });

        });

    }

});
