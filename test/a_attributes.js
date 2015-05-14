"use strict";
/*global describe, it, assert*/

describe("a_attributes", function () {

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
                    "[a]": [new TestAttribute()],
                    a: 0
                });

            it("prevents defining the attribute twice (define)", function () {
                var caught = null;
                try {
                    gpf.define("TestClass2", TestClass, {
                        "[b]": [new TestAttribute()],
                        b: 0
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