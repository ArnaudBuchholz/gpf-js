"use strict";

describe("define/definition/class", function () {

    if (gpf.internals) {

        var _GpfClassDefinition = gpf.internals._GpfClassDefinition;

        describe("Class definition basics", function () {

            it("exposes name properties (no namespace)", function () {
                var classA = new _GpfClassDefinition("A");
                assert("A" === classA.getName());
                assert("" === classA.getNamespace());
                assert("A" === classA.getQualifiedName());
            });

            it("exposes name properties (with namespace)", function () {
                var classA = new _GpfClassDefinition("test.A");
                assert("A" === classA.getName());
                assert("test" === classA.getNamespace());
                assert("test.A" === classA.getQualifiedName());
            });

        });

    }

});
