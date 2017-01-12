"use strict";

describe("define/checkDefinition", function () {

    if (gpf.internals) {

        describe("(internal) _gpfDefineTransformDefinition", function () {

            var _gpfDefineTransformDefinition = gpf.internals._gpfDefineTransformDefinition;

            it("returns a different definition object", function () {

                var definition = {};
                assert(definition !== _gpfDefineTransformDefinition(definition));

            });

            it("converts $class into $type and $name", function () {
                var transformed = _gpfDefineTransformDefinition({
                    $class: "Test"
                });
                assert("class" === transformed.$type);
                assert("Test" === transformed.$name);
            });

            it("converts $class into $type, $name and $namespace (absolute)", function () {
                var transformed = _gpfDefineTransformDefinition({
                    $class: "gpf.test.Test"
                });
                assert("class" === transformed.$type);
                assert("Test" === transformed.$name);
                assert("gpf.test" === transformed.$namespace);
            });

            it("converts $class into $type, $name and $namespace (relative)", function () {
                var transformed = _gpfDefineTransformDefinition({
                    $class: "test.Test",
                    $namespace: "gpf"
                });
                assert("class" === transformed.$type);
                assert("Test" === transformed.$name);
                assert("gpf.test" === transformed.$namespace);
            });

            it("prioritize $class over $name", function () {
                var transformed = _gpfDefineTransformDefinition({
                    $class: "Test",
                    $name: "Any"
                });
                assert("class" === transformed.$type);
                assert("Test" === transformed.$name);
            });

        });

    }

});
