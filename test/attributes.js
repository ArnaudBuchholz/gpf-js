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

    });

    describe("gpf.attributes.Array", function () {

        it("allows to test the presence of an attribute"); // has
        it("filters on attribute type"); // filter
        it("offers an enumeration function"); // each

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

        it("offers an enumeration function"); // each
        it("can copy attributes to another class"); //

    });

});