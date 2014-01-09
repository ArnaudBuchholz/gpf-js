(function () { /* Begin of privacy scope */

    var
        A = gpf.Class.extend({

            "[_a]": [ gpf.$ClassProperty(false) ],
            _a: 0,

            "[_aLittleBitMoreThanB]": [ gpf.$ClassProperty(true, "b") ],
            _aLittleBitMoreThanB: 0,

            init: function () {
                this._a = 0;
                this._aLittleBitMoreThanB = 1;
            }

        });

    gpf.declareTests({

        "basic": [

            function (test) {
                test.title("Use of $ClassProperty");
                var a = new A();
                test.equal(a.a(), 0, "a getter declared");
                test.equal(a.b(), 1, "b getter declared");
                a.b(2);
                test.equal(a.b(), 2, "b setter declared and working");
            }

        ],

        "error": [

            function (test) {
                test.title("Access to read only member");
                var
                    a = new A(),
                    caught = null;
                try {
                    a.a(2); // Should be read only
                }
                catch (e) {
                    caught = e;
                }
                test.assert(null === caught, caught, "No exception thrown");
                test.equal(a.a(), 0, "Value not modified");
            },

            function (test) {
                test.title("Invalid declaration (related to attributes.js)");
                var caught = null;
                try {
                    A.extend({

                        "[_c]": [ gpf.$ClassProperty(true) ] // should fail

                    });
                }
                catch (e) {
                    caught = e;
                }
                test.assert(null === caught, caught, "No exception thrown");
/*
                test.assert(null !== caught
                    && caught instanceof gpf.ClassAttributeError
                    && caught.name() === "ClassAttributeError"
                    && caught.member() === "_c", "Exception documented");
*/
            }

        ]

    });

})();
/* End of privacy scope */
