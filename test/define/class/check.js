"use strict";

describe("define/class/check", function () {

    if (gpf.internals) {

        describe("(internal) _GpfClassDefinition", function () {

            var _GpfClassDefinition = gpf.internals._GpfClassDefinition,
                _gpfDefineBuildTypedEntity = gpf.internals._gpfDefineBuildTypedEntity;

            it("is used for class definition", function () {
                var definition = _gpfDefineBuildTypedEntity({
                    $class: "Test"
                });
                assert(definition instanceof _GpfClassDefinition);
            });

            it("accepts a valid class definition", function () {
                _gpfDefineBuildTypedEntity({
                    $class: "Test",
                    member: function () {}
                });
            });

            [
                "startingWithLowercaseLetterIsNotOK",
                "The$signIsForbbidenIfNotAtTheBeginning",
                "The_signIsForbbidenIfNotAtTheBeginning"
            ].forEach(function (invalidClassName) {
                it("rejects invalid class name (" + invalidClassName + ")", function () {
                    var exceptionCaught;
                    try {
                        _gpfDefineBuildTypedEntity({
                            $class: invalidClassName
                        });
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.InvalidClassName);
                });

            });

            [
                "StartingWithUppercaseLetterIsNotOK",
                "the$signIsForbbidenIfNotAtTheBeginning",
                "the_signIsForbbidenIfNotAtTheBeginning",
                "class"
            ].forEach(function (invalidPropertyName) {
                it("rejects invalid property name (" + invalidPropertyName + ")", function () {
                    var rawDefinition = {
                            $class: "Test"
                        },
                        exceptionCaught;
                    rawDefinition[invalidPropertyName] = true;
                    try {

                        _gpfDefineBuildTypedEntity(rawDefinition);
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.InvalidClassProperty);
                });

            });

        });

    }

});
