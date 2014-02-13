(function () { /* Begin of privacy scope */
    "use strict";

    var
        TestAttribute = gpf.attributes.Attribute.extend({}),
        Test1ValueAttribute = TestAttribute.extend({ }),
        $Test1Value = function () {
            return new Test1ValueAttribute();
        },
        Test2ValueAttribute = TestAttribute.extend({ }),
        $Test2Value = function () {
            return new Test2ValueAttribute();
        },

        A = gpf.Class.extend({

            "[_a]": [ $Test1Value() ],
            _a: 0,

            "[_c]": [ $Test1Value() ],
            _c: 0,

            init: function (value) {
                this._a = value;
            },

            a: function () {
                return this._a;
            }

        }),

        B = A.extend({

            "[_b]": [ $Test2Value() ],
            _b: 0,

            "[_c]": [ $Test2Value() ],
            _c: 0,

            init: function (value) {
                this._super(value - 1);
                this._b = value;
            },

            b: function () {
                return this._b;
            }

        })
        ;

    gpf.declareTests({

        "basic": [

            function (test) {
                test.title("Declaration & inheritance");
                test.log("Check the existence of attributes on class A");
                var a = new A();
                var attributesA = new gpf.attributes.Map(a);
                test.equal(attributesA.count(), 2, "2 attributes on a");
                test.log("Check the existence of attributes on member A::_c");
                test.equal(attributesA.member("_c").length(), 1,
                    "Attribute found on _c");
                test.log("Check the existence of attributes on class B");
                var b = new B();
                var attributesB = new gpf.attributes.Map(b);
                test.equal(attributesB.count(), 4, "4 attributes on b");
                test.log("Check the existence of attributes on member B::_c");
                test.equal(attributesB.member("_c").length(), 2,
                    "2 attributes on _c");
            },

            function (test) {
                test.title("AttributeList member");
                test.log("Check the existence of attributes on class B");
                var b = new B();
                var attributesB = new gpf.attributes.Map(b);
                var attributesBTest2Value = attributesB
                    .filter(Test2ValueAttribute);
                test.equal(attributesBTest2Value.count(), 2,
                    "2 $Test2Value on b");
                test.log("Check the existence of Test2Value attributes on _c");
                test.equal(attributesBTest2Value.member("_c").length(), 1,
                    "1 $Test2Value on _c");
            }

        ]

    });


}());
/* End of privacy scope */
