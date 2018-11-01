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
                assert(definition._type === "class");
                assert(definition._name === "Test");
            });

            it("converts $class into _type, _name and _namespace (absolute)", function () {
                var definition = _gpfDefineBuildTypedEntity({
                    $class: "gpf.test.Test"
                });
                assert(definition._type === "class");
                assert(definition._name === "Test");
                assert(definition._namespace === "gpf.test");
            });

            it("converts $class into _type, _name and _namespace (relative)", function () {
                var definition = _gpfDefineBuildTypedEntity({
                    $class: "test.Test",
                    $namespace: "gpf"
                });
                assert(definition._type === "class");
                assert(definition._name === "Test");
                assert(definition._namespace === "gpf.test");
            });

            it("prioritize $class over $name", function () {
                var definition = _gpfDefineBuildTypedEntity({
                    $class: "Test",
                    $name: "Any"
                });
                assert(definition._type === "class");
                assert(definition._name === "Test");
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
