(function () { /* Begin of privacy scope */
    "use strict";

    gpf.declareTests({

        "documentation": [

            function (test) {
                test.title("Checking error content");
                try {
                    throw gpf.Error.Abstract();
                } catch (e) {
                    test.assert(e instanceof gpf.Error, "Got a gpf.Error");
                    test.equal(e.code, gpf.Error.CODE_ABSTRACT,
                        "Error code is mapped on a constant");
                    test.equal(e.name, "Abstract", "Error name");
                    test.equal(e.message, "Abstract", "Error message");
                }
            },

            function (test) {
                test.title("Checking parameter use in message");
                try {
                    throw gpf.Error.InterfaceExpected({
                        name: "Test"
                    });
                } catch (e) {
                    test.assert(e instanceof gpf.Error, "Got a gpf.Error");
                    test.equal(e.code, gpf.Error.CODE_INTERFACEEXPECTED,
                        "Error code is mapped on a constant");
                    test.equal(e.name, "InterfaceExpected", "Error name");
                    test.equal(e.message,
                        "Expected interface not implemented: Test",
                        "Error message");
                }
            }

        ]

    });

})(); /* End of privacy scope */
