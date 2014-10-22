(function () { /* Begin of privacy scope */
    "use strict";

    gpf.declareTests({

        "array": [

            function (test) {
                test.title("Array constructor");
                var
                    array = new Array(5),
                    idx;
                test.equal(array.length, 5, "Size of the array");
                for (idx = 0; idx < 5; ++idx) {
                    test.equal(array[idx], undefined, "Items are undefined");
                }
                test.equal(array.join(" "), "    ", "Joining works (4 spaces)");
            }

        ]

    });

})(); /* End of privacy scope */
