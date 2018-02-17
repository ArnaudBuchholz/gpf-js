"use strict";

describe("define/definition/class", function () {

    if (gpf.internals) {

        var _GpfClassDefinition = gpf.internals._GpfClassDefinition,
            _GpfClassDefMember = gpf.internals._GpfClassDefMember;

        describe("Class name", function () {

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

        describe("Class members", function () {

            it("prevents adding a member twice", function () {
                var caught = false;
                try {
                    var classA = new _GpfClassDefinition("test.A");
                    classA.addMember(new _GpfClassDefMember("member1", 12));
                    classA.addMember(new _GpfClassDefMember("member1", 13));
                } catch (e) {
                    assert(e instanceof gpf.Error);
                    assert(e.code === gpf.Error.CODE_CLASSMEMBERALREADYEXIST);
                    assert(e.code === gpf.Error.classMemberAlreadyExist.CODE);
                    assert(e.name === "classMemberAlreadyExist");
                    caught = true;
                }
                assert(true === caught);
            });

        });

        describe("Inheritance", function () {

            it("gives access to inherited members", function () {
                var classA = new _GpfClassDefinition("test.A"),
                    classB,
                    member;
                classA.addMember(new _GpfClassDefMember("member1", 12));
                classB = new _GpfClassDefinition("test.B", classA);
                member =  classB.getMember("member1");
                assert(member instanceof _GpfClassDefMember);
                assert(member.getClassDefinition() === classA);
            });

        });

    }

});
