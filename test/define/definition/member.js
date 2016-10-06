"use strict";

describe("define/definition/member", function () {

    if (gpf.internals) {

        var _GpfClassDefinition = gpf.internals._GpfClassDefinition,
            _GpfClassDefMember = gpf.internals._GpfClassDefMember;

        describe("class definition", function () {

            it("gives access to class definition", function () {
                var classA = new _GpfClassDefinition("test.A"),
                    member = new _GpfClassDefMember("member1", 12);
                assert(!member.getClassDefinition());
                classA.addMember(member);
                assert(member.getClassDefinition() === classA);
            });

        });

        describe("typing", function () {

            it("handles default type", function () {
                var member = new _GpfClassDefMember("member1");
                assert(member.getType() === "undefined");
            });

            it("validates provided type (correct)", function () {
                var member = new _GpfClassDefMember("member1", 12, "number");
                assert(member);
            });

            it("validates provided type (incorrect)", function () {
                var caught = false;
                try {
                    var member = new _GpfClassDefMember("member1", 12, "invalid");
                    assert(member);
                } catch (e) {
                    assert(e instanceof gpf.Error);
                    assert(e.code === gpf.Error.CODE_INVALIDCLASSMEMBERTYPE);
                    assert(e.code === gpf.Error.invalidClassMemberType.CODE);
                    assert(e.name === "invalidClassMemberType");
                    caught = true;
                }
                assert(true === caught);
            });

            it("deduces type from default value", function () {
                var member = new _GpfClassDefMember("member1", 12);
                assert(member.getType() === "number");
            });

        });

    }

});
