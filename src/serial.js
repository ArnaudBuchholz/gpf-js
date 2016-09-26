/**
 * @file Serialization mechanism
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfA*/ // _gpfA
/*global _gpfANoSerial*/ // gpf.attributes.ClassNonSerializedAttribute
/*#endif*/

/**
 * Offer a common framework for JavaScript objects serialization, might use XML or JSON or anything else
 */

/**
 * TODO there must be a way to make it less specific to JSON ==> Yep, use an interface
 * TODO handle object sub members
 * TODO handle before/after load methods
 * TODO handle before/after save methods
 */

gpf.serial = {

    load: function (object, storage) {
        var
            prototype = object.constructor.prototype,
            attributes = new _gpfA.Map(object),
            member,
            serializationMember;
        /*jshint -W089*/ // Actually, I want all properties
        for (member in prototype) {
            if ("function" === typeof prototype[member]
                || attributes.member(member).has(_gpfANoSerial)) {
                continue; // Ignore functions & unwanted members
            }
            /*
             * We have a member that must be serialized,
             * by default members with a starting _ will be initialized from
             * the corresponding member (without _) of the json object
             */
            if (0 === member.indexOf("_")) {
                serializationMember = member.substr(1);
            } else {
                serializationMember = member;
            }
            if (storage.hasValueFor(serializationMember)) {
                object[member] = storage.getValueFor(serializationMember);
            } else {
                // Reset the value coming from the prototype
                object[member] = prototype[member];
            }
        }
        return object;
    },
    /*jshint +W089*/


    save: function (object, storage) {
        var
            result = {},
            prototype = object.constructor.prototype,
            attributes = new _gpfA.Map(object),
            member,
            serializationMember,
            value;
        /*jshint -W089*/ // Actually, I want all properties
        for (member in prototype) {
            if ("function" === typeof prototype[member]
                || attributes.member(member).has(_gpfANoSerial)) {
                continue; // Ignore functions & unwanted members
            }
            /*
             * We have a member that must be serialized,
             * by default members with a starting _ will be initialized from
             * the corresponding member (without _) of the json object
             */
            if (0 === member.indexOf("_")) {
                serializationMember = member.substr(1);
            } else {
                serializationMember = member;
            }
            value = object[member];
            if (value !== prototype[member]) {
                storage.setValueFor(serializationMember, value);
            }
        }
        return result;

    }
    /*jshint +W089*/

};

/*
describe("gpf.json.load and gpf.json.save", function () {

    var A = gpf.define("A", {

        "-": {
            "[_member1]": [gpf.$ClassProperty(true)],
            _member1: 34,

            "[_member2]": [gpf.$ClassProperty(true)],
            _member2: "abc",

            "[_ignoredMember]": [gpf.$ClassProperty(true), gpf.$ClassNonSerialized()],
            _ignoredMember: "def"

        },

        "+": {

            member3: false

        }

    });

    it("save changed members to json", function () {
        var a = new A(),
            saved;
        a.member2("ghi"); // Change value to ensure serialization
        a.member3 = true;
        a.ignoredMember("jkl");
        saved = gpf.json.save(a);
        assert(undefined === saved.member1); // unchanged is not serialized
        assert("ghi" === saved.member2);
        assert(true === saved.member3);
        assert(undefined === saved.ignoredMember); // ignored
    });

    it("load members from json", function () {
        var a = new A(),
            saved = {
                member2: "ghi",
                member3: true,
                ignoredMember: "jkl"
            };
        a.member1("12");
        a.ignoredMember("mno");
        gpf.json.load(a, saved);
        assert(34 === a.member1()); // restored to initial value
        assert("ghi" === a.member2());
        assert(true === a.member3);
        assert("mno" === a.ignoredMember()); // ignored
    });

});
*/
