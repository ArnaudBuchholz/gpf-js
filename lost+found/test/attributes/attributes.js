"use strict";

describe("attributes/attributes", function () {

    var
        AttributeClass = gpf.attributes.Attribute;

    describe("gpf.$ClassAttribute", function () {

        it("can't be used on non-attribute classes", function () {
            var caught = null;
            try {
                gpf.define("TestClass", {
                    "[Class]": [gpf.$ClassAttribute()]
                });
            } catch (e) {
                caught = e;
            }
            assert(null !== caught);
            assert(caught.name === "onlyForAttributeClass");
        });

        var
            TestAttribute = gpf.define("TestAttribute", AttributeClass, {
                "[Class]": [gpf.$ClassAttribute()]
            });

        it("can be used on Class", function () {
            var caught = null;
            try {
                gpf.define("TestClass", {
                    "[Class]": [new TestAttribute()]
                });
            } catch (e) {
                caught = e;
            }
            assert(null === caught);
        });

        it("can't be used on members", function () {
            var caught = null;
            try {
                gpf.define("TestClass", {
                    "[a]": [new TestAttribute()],
                    a: 0
                });
            } catch (e) {
                caught = e;
            }
            assert(null !== caught);
            assert(caught.name === "classOnlyAttribute");
        });

    });

    describe("gpf.$MemberAttribute", function () {

        it("can't be used on non-attribute classes", function () {
            var caught = null;
            try {
                gpf.define("TestClass", {
                    "[Class]": [gpf.$MemberAttribute()]
                });
            } catch (e) {
                caught = e;
            }
            assert(null !== caught);
            assert(caught.name === "onlyForAttributeClass");
        });

        var
            TestAttribute = gpf.define("TestAttribute", AttributeClass, {
                "[Class]": [gpf.$MemberAttribute()]
            });

        it("can be used on members", function () {
            var caught = null;
            try {
                gpf.define("TestClass", {
                    "[a]": [new TestAttribute()],
                    a: 0
                });
            } catch (e) {
                caught = e;
            }
            assert(null === caught);
        });

        it("can't be used on Class", function () {
            var caught = null;
            try {
                gpf.define("TestClass", {
                    "[Class]": [new TestAttribute()]
                });
            } catch (e) {
                caught = e;
            }
            assert(null !== caught);
            assert(caught.name === "memberOnlyAttribute");
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
            assert(caught.name === "onlyForAttributeClass");
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
                assert(caught.name === "uniqueAttributeConstraint");
            });

            it("prevents defining the attribute twice (add)", function () {
                var caught = null;
                try {
                    gpf.attributes.add(TestClass, "Class", new TestAttribute());
                } catch (e) {
                    caught = e;
                }
                assert(null !== caught);
                assert(caught.name === "uniqueAttributeConstraint");
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
                assert(caught.name === "uniqueMemberAttributeConstraint");
            });

            it("prevents defining the attribute twice (add)", function () {
                var caught = null;
                try {
                    gpf.attributes.add(TestClass, "a", new TestAttribute());
                } catch (e) {
                    caught = e;
                }
                assert(null !== caught);
                assert(caught.name === "uniqueMemberAttributeConstraint");
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
