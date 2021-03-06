"use strict";

describe("attributes", function () {

    var
        TestAttribute = gpf.define("TestAttribute", "gpf.attributes.Attribute"),
        Test1ValueAttribute = gpf.define("Test1ValueAttribute", TestAttribute),
        Test2ValueAttribute = gpf.define("Test2ValueAttribute", TestAttribute),

        A = gpf.define("A", {
            "protected": {

                "[_a]": [new Test1ValueAttribute()],
                _a: 0,

                "[_c]": [new Test1ValueAttribute()],
                _c: 0

            },
            "public": {

                "[constructor]": [new Test1ValueAttribute()],
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
            "protected": {

                "[_b]": [new Test2ValueAttribute()],
                _b: 0,

                "[_c]": [new Test2ValueAttribute()],
                _c: 0

            },
            "public": {

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
            var attributes = new gpf.attributes.Map(a),
                attribute;
            assert(3 === attributes.getCount());
            assert(1 === attributes.getMemberAttributes("_a").getItemsCount());
            attribute = attributes.getMemberAttributes("_a").getItem(0);
            assert("_a" === attribute.getMemberName());
            assert(0 === attributes.getMemberAttributes("_b").getItemsCount());
            assert(1 === attributes.getMemberAttributes("_c").getItemsCount());
            assert(1 === attributes.getMemberAttributes("constructor").getItemsCount());
        });

        it("inherits from base class", function () {
            var attributes = new gpf.attributes.Map(b);
            assert(5 === attributes.getCount());
            assert(1 === attributes.getMemberAttributes("_a").getItemsCount());
            assert(1 === attributes.getMemberAttributes("_b").getItemsCount());
            assert(2 === attributes.getMemberAttributes("_c").getItemsCount());
        });

        it("signals any use on non-existing member", function () {
            var caught = null;
            if (console.expects) {
                console.expects("error", "gpf.define: Invalid attribute name '_b'", false);
            }
            try {
                gpf.define("C", A, {
                    "[_b]": [new Test1ValueAttribute()] // should fail
                });
            } catch (e) {
                caught = e;
            }
            assert(null === caught);
        });

    });

    describe("gpf.attributes.Array", function () {

        it("allows to test the presence of an attribute", function () {
            var attributes = new gpf.attributes.Map(a),
                attributesForA = attributes.getMemberAttributes("_a");
            assert(1 === attributesForA.getItemsCount());
            assert(true === attributesForA.has(Test1ValueAttribute));
            assert(false === attributesForA.has(Test2ValueAttribute));
        });

        it("filters on attribute type", function () {
            var attributes = new gpf.attributes.Map(b),
                attributesForC = attributes.getMemberAttributes("_c"),
                test1ValueAttributesForC = attributesForC.filter(Test1ValueAttribute),
                test2ValueAttributesForC = attributesForC.filter(Test2ValueAttribute);
            assert(2 === attributesForC.getItemsCount());
            assert(true === test1ValueAttributesForC.has(Test1ValueAttribute));
            assert(false === test1ValueAttributesForC.has(Test2ValueAttribute));
            assert(false === test2ValueAttributesForC.has(Test1ValueAttribute));
            assert(true === test2ValueAttributesForC.has(Test2ValueAttribute));
        });

        it("offers an enumeration function based on [].forEach", function () {
            var attributes = new gpf.attributes.Map(b),
                attributesForC = attributes.getMemberAttributes("_c"),
                dictionaryOfAttributesForC = {},
                result = attributesForC.forEach(function (attribute, idx, array) {
                    assert("number" === typeof idx);
                    assert(attribute instanceof gpf.attributes.Attribute);
                    assert(array instanceof Array);
                    assert(2 === array.length);
                    dictionaryOfAttributesForC[attribute.constructor.compatibleName()] = [attribute];
                });
            assert(undefined === result);
            assert(1 === dictionaryOfAttributesForC.Test1ValueAttribute.length);
            assert(1 === dictionaryOfAttributesForC.Test2ValueAttribute.length);
        });

        it("offers an enumeration function based on [].every", function () {
            var attributes = new gpf.attributes.Map(b),
                attributesForC = attributes.getMemberAttributes("_c"),
                selectedAttribute,
                result = attributesForC.every(function (attribute, idx, array) {
                    assert("number" === typeof idx);
                    assert(2 === array.length);
                    selectedAttribute = attribute;
                    return !(attribute instanceof Test1ValueAttribute);
                });
            assert(false === result);
            assert(selectedAttribute instanceof Test1ValueAttribute);
        });

    });

    describe("gpf.attributes.Map", function () {

        it("lists members that have attributes", function () {
            var attributes = new gpf.attributes.Map(a),
                members = attributes.getMembers();
            assert(3 === members.length);
            // Order is not guaranteed
            assert(undefined !== gpf.test(members, "_a"));
            assert(undefined !== gpf.test(members, "_c"));
            assert(undefined !== gpf.test(members, "constructor"));
        });

        it("filters on attribute type", function () {
            var attributes = new gpf.attributes.Map(b),
                attributesTest2Value = attributes.filter(Test2ValueAttribute);
            assert(2 === attributesTest2Value.getCount());
            assert(1 === attributesTest2Value.getMemberAttributes("_c").getItemsCount());
        });

        it("offers an enumeration function based on [].forEach", function () {
            var attributes = new gpf.attributes.Map(a),
                members = [],
                result = attributes.forEach(function (attributeArray, member, dictionary) {
                    assert("string" === typeof member);
                    assert(attributeArray instanceof gpf.attributes.Array);
                    assert(null !== dictionary);
                    members.push(member);
                });
            assert(undefined === result);
            assert(3 === members.length);
            // Order is not guaranteed
            assert(undefined !== gpf.test(members, "_a"));
            assert(undefined !== gpf.test(members, "_c"));
            assert(undefined !== gpf.test(members, "constructor"));
        });

        it("is modifiable without altering initial list", function () {
            var attributes = new gpf.attributes.Map(a),
                attributesForA,
                attributes2;
            attributes.add("_a", new Test2ValueAttribute());
            assert(4 === attributes.getCount());
            attributesForA = attributes.getMemberAttributes("_a");
            assert(2 === attributesForA.getItemsCount());
            attributes2 = new gpf.attributes.Map(a);
            assert(3 === attributes2.getCount());
            attributesForA = attributes2.getMemberAttributes("_a");
            assert(1 === attributesForA.getItemsCount());
        });

    });

});
