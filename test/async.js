(function () { /* Begin of privacy scope */
    "use strict";

    gpf.declareTests({

        "callback": [

            function (test) {
                test.title("Checking that callback and scope are used");
                test.wait();
                gpf.defer(test.done, 0, test);
            },

            function (test) {
                test.title("Checking that parameters are transmitted");
                test.wait();
                gpf.defer(function () {
                    test.equal(this, test, "Scope transmitted");
                    test.equal(arguments.length, 4,
                        "Correct number of parameters");
                    test.equal(arguments[0], 1,
                        "First parameter is a number");
                    test.equal(arguments[1], "abc",
                        "Second parameter is a string");
                    test.equal(arguments[2], undefined,
                        "Third parameter is undefined");
                    test.like(arguments[3], test,
                        "Fourth parameter is an object");
                    test.done();
                }, 0, test, [1, "abc", undefined, test]);
            }

        ]

    });

})(); /* End of privacy scope */
