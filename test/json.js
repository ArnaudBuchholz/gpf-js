"use strict";
/*global describe, it, assert*/

describe("json", function () {

    var
        tests = [{
            label: "empty object",
            obj: {},
            json: "{}"

        } , {
            label: "simple string property",
            obj: {
                a: "123"
            },
            json: "{\"a\":\"123\"}"

        }, {
            label: "simple number property",
            obj: {
                a: 123
            },
            json: "{\"a\":123}"

        }, {
            label: "simple boolean properties",
            obj: {
                a: true,
                b: false
            },
            json: "{\"a\":true,\"b\":false}"

        }, {
            label: "mixed simple properties",
            obj: {
                a: "123",
                b: 123,
                c: true,
                d: {}
            },
            json: "{\"a\":\"123\",\"b\":123,\"c\":true,\"d\":{}}"

        }],
        len = tests.length,
        idx;

    describe("gpf.json.stringify", function () {

        function makeIt(test) {
            it("works on " + test.label, function () {
                assert(gpf.json.stringify(test.obj) === test.json);
            });
        }

        for (idx = 0; idx < len; ++idx) {
            makeIt(tests[idx]);
        }

    });

    describe("gpf.json.parse", function () {

        function makeIt(test) {
            it("works on " + test.label, function () {
                var obj = gpf.json.parse(test.json);
                assert(true === gpf.like(obj, test.obj));
            });
        }

        for (idx = 0; idx < len; ++idx) {
            makeIt(tests[idx]);
        }

    });

    describe("gpf.json.load and gpf.json.save", function () {

        var A = gpf.define("A", {

                private: {
                    "[_member1]": [gpf.$ClassProperty(true)],
                    _member1: 34,

                    "[_member2]": [gpf.$ClassProperty(true)],
                    _member2: "abc",

                    "[_ignoredMember]": [gpf.$ClassProperty(true),
                        gpf.$ClassNonSerialized()],
                    _ignoredMember: "def"

                },

                public: {

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

});