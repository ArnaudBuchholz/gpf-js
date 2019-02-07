"use strict";

describe("attributes/serializable", function () {

    var A;

    before(function () {
        A = gpf.define({
            $class: "A",

            "[_member1]": [new gpf.attributes.Serializable({
                type: gpf.serial.types.string,
                required: true
            })],
            _member1: "0",

            "[member2]": [new gpf.attributes.Serializable()],
            member2: ""
        });
    });

    describe("gpf.attributes.Serializable", function () {

        it("provides serialization information on members", function () {
            var attributes = gpf.attributes.get(A, gpf.attributes.Serializable),
                member1 = attributes._member1[0].getProperty(),
                member2 = attributes.member2[0].getProperty();
            assert(member1.name === "member1");
            assert(member1.type === gpf.serial.types.string);
            assert(member1.required);
            assert(member2.name === "member2");
            assert(member2.type === gpf.serial.types.string);
            assert(!member2.required);
        });

    });

});
