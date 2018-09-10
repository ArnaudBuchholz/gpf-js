"use strict";

describe("attributes/serializable", function () {

    var A;

    before(function () {
        A = gpf.define({
            $class: "A",

            "[_member1]": [new gpf.attributes.Serializable({
                name: "Member1",
                type: gpf.serial.types.string,
                required: true
            })],
            _member1: "0",

            "[_member2]": [new gpf.attributes.Serializable({
                name: "Member2"
            })],
            _member2: ""
        });
    });

    describe("gpf.attributes.Serializable", function () {

        it("provides serialization information on members", function () {
            var attributes = gpf.attributes.get(A, gpf.attributes.Serializable),
                member1 = attributes._member1[0].getProperty(),
                member2 = attributes._member2[0].getProperty();
            assert(member1.name === "Member1");
            assert(member1.type === gpf.serial.types.string);
            assert(member1.required);
            assert(member2.name === "Member2");
            assert(member2.type === gpf.serial.types.string);
            assert(!member2.required);
        });

    });

});
