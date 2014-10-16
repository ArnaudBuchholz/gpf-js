(function () { /* Begin of privacy scope */
    "use strict";

    gpf.declareTests({

        "simple": [

            function (test) {
                test.wait();
                var
                    value = 0,
                    promise = new gpf.Promise();
                promise
                    .then(function (event) {
                        test.equal(++value, 1, "First step");
                        test.equal(event.type(), "then", "THEN");
                        event.scope().resolve();
                    })
                    .then(function (event) {
                        test.equal(++value, 2, "Last step");
                        test.equal(event.type(), "then", "THEN");
                        test.done();
                    });
                promise.resolve();
            }

        ]

    });

})(); /* End of privacy scope */
