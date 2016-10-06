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

            it("accepts any member type", function () {
                var member = new _GpfClassDefMember("member1", 12, "real");
                assert(member.getType() === "real");
            });

            it("deduces type from default value", function () {
                var member = new _GpfClassDefMember("member1", 12);
                assert(member.getType() === "number");
            });

        });

    }

});
