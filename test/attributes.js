"use strict";
/*global describe, it, assert*/

describe("attributes", function () {

    var
        TestAttribute = gpf.define("TestAttribute", "gpf.attributes.Attribute"),
        Test1ValueAttribute = gpf.define("Test1ValueAttribute", TestAttribute),
        $Test1Value = function () {
            return new Test1ValueAttribute();
        },
        Test2ValueAttribute = gpf.define("Test2ValueAttribute", TestAttribute),
        $Test2Value = function () {
            return new Test2ValueAttribute();
        },

        A = gpf.define("A", {

            protected: {

                "[_a]": [ $Test1Value() ],
                _a: 0,

                "[_c]": [ $Test1Value() ],
                _c: 0

            },

            public: {

                constructor: function (value) {
                    this._a = value;
                },

                a: function () {
                    return this._a;
                }

            }

        }),

        a = new A(),

        B = gpf.define("B", A, {

            protected: {

                "[_b]": [$Test2Value()],
                _b: 0,

                "[_c]": [$Test2Value()],
                _c: 0

            },

            public: {

                constructor: function (value) {
                    this._super(value - 1);
                    this._b = value;
                },

                b: function () {
                    return this._b;
                }
            }

        }),

        b = new B();

    describe("gpf.attributes.Attribute", function () {

        it("is available through gpf.attributes.Map", function () {
            var attributes = new gpf.attributes.Map(a);
            assert(2 === attributes.count());
            assert(1 === attributes.member("_a").count());
            assert(0 === attributes.member("_b").count());
            assert(1 === attributes.member("_c").count());
        });

        it("inherits from base class", function () {
            var attributes = new gpf.attributes.Map(b);
            assert(4 === attributes.count());
            assert(1 === attributes.member("_a").count());
            assert(1 === attributes.member("_b").count());
            assert(2 === attributes.member("_c").count());
        });

        it("signals any use on non-existing member"/*, function () {
            var caught = null,
                output = [];
            test.hookConsole(output);
            try {
                gpf.define("B", A, {
                   "[_c]": [ gpf.$ClassProperty(true) ] // should fail
               });
            }
            catch (e) {
                caught = e;
            }
            test.assert(null === caught, caught, "No exception thrown");
            test.releaseConsole();
            test.assert(1 === output.length,
              "A console output has been generated");
            if (1 === output.length) {
                test.assert(output[0].error,
                  "An error was displayed in the console");
            }
        }*/);

    });

    describe("gpf.attributes.Array", function () {

        it("allows to test the presence of an attribute", function () {
            var attributes = new gpf.attributes.Map(a),
                attributesForA = attributes.member("_a");
            assert(1 === attributesForA.count());
            assert(null !== attributesForA.has(Test1ValueAttribute));
            assert(null === attributesForA.has(Test2ValueAttribute));
        });

        it("filters on attribute type", function () {
            var attributes = new gpf.attributes.Map(b),
                attributesForC = attributes.member("_c"),
                test1ValueAttributesForC =
                    attributesForC.filter(Test1ValueAttribute),
                test2ValueAttributesForC =
                    attributesForC.filter(Test2ValueAttribute);
            assert(2 === attributesForC.count());
            assert(null !== test1ValueAttributesForC.has(Test1ValueAttribute));
            assert(null === test1ValueAttributesForC.has(Test2ValueAttribute));
            assert(null === test2ValueAttributesForC.has(Test1ValueAttribute));
            assert(null !== test2ValueAttributesForC.has(Test2ValueAttribute));
        }); // filter

        it("offers an enumeration function based on gpf.each", function () {
            var attributes = new gpf.attributes.Map(b),
                attributesForC = attributes.member("_c"),
                dictionaryOfAttributesForC = {},
                result = attributesForC.each(function (idx, attribute, len) {
                    assert("number" === typeof idx);
                    assert(attribute instanceof gpf.attributes.Attribute);
                    assert("number" === typeof len);
                    assert(2 === len);
                    dictionaryOfAttributesForC
                        [attribute.constructor.compatibleName()]
                        = [attribute];
                });
            assert(undefined === result);
            assert(1 === dictionaryOfAttributesForC.Test1ValueAttribute.length);
            assert(1 === dictionaryOfAttributesForC.Test2ValueAttribute.length);
        });

        it("offers a stoppable enumeration function", function () {
            var attributes = new gpf.attributes.Map(b),
                attributesForC = attributes.member("_c"),
                result = attributesForC.each(function (idx, attribute, len) {
                    assert("number" === typeof idx);
                    assert("number" === typeof len);
                    assert(2 === len);
                    if (attribute instanceof Test1ValueAttribute) {
                        return attribute;
                    }
                });
            assert(null !== result);
            assert(result instanceof Test1ValueAttribute);
        });

    });

    describe("gpf.attributes.Map", function () {

        it("lists members that have attributes", function () {
            var attributes = new gpf.attributes.Map(a),
                members = attributes.members();
            assert(2 === members.length);
            assert(undefined !== gpf.test(members, "_a"));
            assert(undefined !== gpf.test(members, "_c"));
        });

        it("filters on attribute type", function () {
            var attributes = new gpf.attributes.Map(b),
                attributesTest2Value =
                    attributes.filter(Test2ValueAttribute);
            assert(2 === attributesTest2Value.count());
            assert(1 === attributesTest2Value.member("_c").count());
        });

        it("offers an enumeration function based on gpf.each", function () {
            var attributes = new gpf.attributes.Map(a),
                members = [],
                result = attributes.each(function (member, attributeArray) {
                    assert("string" === typeof member);
                    assert(attributeArray instanceof gpf.attributes.Array);
                    members.push(member);
                });
            assert(undefined === result);
            assert(2 === members.length);
            assert(undefined !== gpf.test(members, "_a"));
            assert(undefined !== gpf.test(members, "_c"));
        });

        it("offers a stoppable enumeration function", function () {
            var attributes = new gpf.attributes.Map(a),
                result = attributes.each(function (member, attributeArray) {
                    assert("string" === typeof member);
                    assert(attributeArray instanceof gpf.attributes.Array);
                    if ("_a" === member) {
                        return attributeArray;
                    }
                });
            assert(undefined !== result);
            assert(result instanceof gpf.attributes.Array);
        });

        it("is modifiable without altering initial list", function () {
            var attributes = new gpf.attributes.Map(a),
                attributesForA,
                attributes2;
            attributes.add("_a", new Test2ValueAttribute());
            assert(3 === attributes.count());
            attributesForA = attributes.member("_a");
            assert(2 === attributesForA.count());
            attributes2 = new gpf.attributes.Map(a);
            assert(2 === attributes2.count());
            attributesForA = attributes2.member("_a");
            assert(1 === attributesForA.count());
        });

    });

});