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
            assert(1 === attributes.member("_a").length());
            assert(0 === attributes.member("_b").length());
            assert(1 === attributes.member("_c").length());
        });

        it("inherits from base class", function () {
            var attributes = new gpf.attributes.Map(b);
            assert(4 === attributes.count());
            assert(1 === attributes.member("_a").length());
            assert(1 === attributes.member("_b").length());
            assert(2 === attributes.member("_c").length());
        });

        it("signals any use on non-existing member", function () {
            var caught = null;
            console.expects("error", "gpf.define: Invalid attribute name '_b'");
            try {
                gpf.define("C", A, {
                   "[_b]": [$Test1Value()] // should fail
               });
            }
            catch (e) {
                caught = e;
            }
            assert(null === caught);
        });

    });

    describe("gpf.attributes.Array", function () {

        it("allows to test the presence of an attribute", function () {
            var attributes = new gpf.attributes.Map(a),
                attributesForA = attributes.member("_a");
            assert(1 === attributesForA.length());
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
            assert(2 === attributesForC.length());
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
            assert(1 === attributesTest2Value.member("_c").length());
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
            assert(2 === attributesForA.length());
            attributes2 = new gpf.attributes.Map(a);
            assert(2 === attributes2.count());
            attributesForA = attributes2.member("_a");
            assert(1 === attributesForA.length());
        });

    });

    describe("gpf.$UniqueAttribute", function () {

        it("can't be used on non-attribute classes", function () {
            var caught = null;
            try {
                gpf.define("TestClass", {
                    "[Class]": [gpf.$UniqueAttribute()]
                });
            } catch (e) {
                caught = e;
            }
            assert(null !== caught);
            assert(caught.name === "OnlyForAttributeClass");
        });

        describe("(true) for the whole class", function () {

            it("should allow at least one instance", function () {
                var caught = null;
                try {
                    gpf.define("TestAttribute", AttributeClass, {
                        "[Class]": [gpf.$UniqueAttribute(true)]
                    });
                } catch (e) {
                    caught = e;
                }
                assert(null === caught);
            });

            var
                AttributeClass = gpf.attributes.Attribute,
                TestAttribute = gpf.define("TestAttribute", AttributeClass, {
                    "[Class]": [gpf.$UniqueAttribute(true)]
                }),
                TestClass = gpf.define("TestClass", {
                    "[Class]": [new TestAttribute()]
                });

            it("prevents defining the attribute twice (define)", function () {
                var caught = null;
                try {
                    gpf.define("TestClass2", TestClass, {
                        "[Class]": [new TestAttribute()]
                    });
                } catch (e) {
                    caught = e;
                }
                assert(null !== caught);
                assert(caught.name === "UniqueAttributeConstraint");
            });

            it("prevents defining the attribute twice (add)", function () {
                var caught = null;
                try {
                    gpf.attributes.add(TestClass, "Class", new TestAttribute());
                } catch (e) {
                    caught = e;
                }
                assert(null !== caught);
                assert(caught.name === "UniqueAttributeConstraint");
            });

        });

        describe("(false) for members", function () {

            it("should allow at least one instance", function () {
                var caught = null;
                try {
                    gpf.define("TestAttribute", AttributeClass, {
                        "[Class]": [gpf.$UniqueAttribute(false)]
                    });
                } catch (e) {
                    caught = e;
                }
                assert(null === caught);
            });

            var
              AttributeClass = gpf.attributes.Attribute,
              TestAttribute = gpf.define("TestAttribute", AttributeClass, {
                  "[Class]": [gpf.$UniqueAttribute(false)]
              }),
              TestClass = gpf.define("TestClass", {
                  "[a]": [new TestAttribute()],
                  a: 0
              });

            it("prevents defining the attribute twice (define)", function () {
                var caught = null;
                try {
                    gpf.define("TestClass2", TestClass, {
                        "[a]": [new TestAttribute()]
                    });
                } catch (e) {
                    caught = e;
                }
                assert(null !== caught);
                assert(caught.name === "UniqueMemberAttributeConstraint");
            });

            it("prevents defining the attribute twice (add)", function () {
                var caught = null;
                try {
                    gpf.attributes.add(TestClass, "a", new TestAttribute());
                } catch (e) {
                    caught = e;
                }
                assert(null !== caught);
                assert(caught.name === "UniqueMemberAttributeConstraint");
            });

            it("allows use on different members", function () {
                var caught = null;
                try {
                    gpf.define("TestClass2", TestClass, {
                        "[b]": [new TestAttribute()],
                        b: 0
                    });
                } catch (e) {
                    caught = e;
                }
                assert(null === caught);
            });

        });

    });

});