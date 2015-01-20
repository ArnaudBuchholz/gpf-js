(function () { /* Begin of privacy scope */
    "use strict";

    gpf.declareTests({

        "stringify": [

            function (test) {
                test.title("Simple test");
                test.equal(gpf.json.stringify({}), "{}", "OK");
            }

        ],

        "parse": [

            function (test) {
                test.title("Simple test");
                test.like(gpf.json.parse("{}"), {}, "OK");
            }

        ]

    });

})(); /* End of privacy scope */
