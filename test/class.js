(function () { /* Begin of privacy scope */
    "use strict";

    var
        A = gpf.Class.extend({

            _a: 0,

            init: function (value) {
                this._a = value;
            },

            a: function () {
                return this._a;
            }

        }),

        B = A.extend({

            _b: 0,

            init: function (value) {
                this._b = value;
                this._super(value + 1);
            },

            b: function () {
                return this._a + this._b;
            }

        })
        ;

    gpf.declareTests({

        "basic": [

            function (test) {
                test.title("Classical inheritance checks");
                var a = new A(1);
                test.equal(a.a(), 1,
                    "Initialization and access to A::_a");
                var b = new B(1);
                test.equal(b.a(), 2,
                    "Initialization and access to A::_a from B");
                test.equal(b.b(), 3,
                    "Access to A::_a inside B");
                test.assert(b instanceof A, "b is an instance of A");
                test.assert(b instanceof B, "b is an instance of B");
                test.assert(!(a instanceof B), "a is not an instance of B");
                test.assert(B._info._base === A, "b inherits from A");
            }

        ]

    });

}());
/* End of privacy scope */
