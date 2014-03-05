(function () { /* Begin of privacy scope */
    "use strict";

    var
        identifiers = {
            "abc": 3,
            "abc!": 3,
            "0123": -1,
            "_ABcD_0": 7
        };

    gpf.declareTests({

        pattern: [

            function (test) {
                test.title("Simple expressions");
                var
                    pattern = new gpf.Pattern("abc"),
                    ctx1, ctx2, ctx3;
                // First verify that failure works
                ctx1 = pattern.allocate();
                test.equal(pattern.write(ctx1, "a"), 0, "Need more input");
                test.equal(pattern.write(ctx1, "b"), 0, "Need more input");
                test.equal(pattern.write(ctx1, "d"), -1,
                    "No chance of matching");
                test.equal(pattern.write(ctx1, "c"), -1,
                    "Not even after sending the right character");
                // Then verify that matching works
                ctx2 = pattern.allocate();
                test.equal(pattern.write(ctx2,"ab"), 0, "Need more input");
                test.equal(ctx2.push("c"), 3, "Matching with the correct length");
                test.equal(ctx2.push("d"), 3,
                    "Any other char doesn't change the result");
                // Check that immediate match works
                ctx3 = pattern.allocate();
                test.equal(ctx3.push("abcd"), 3,
                    "The first 3 chars are matching");
            },

            function (test) {
                test.title("Identifiers");
                var
                    pattern = new gpf.Pattern("[_a-zA-Z][_a-zA-Z0-9]*"),
                    key, expectedResult;
                for (key in identifiers) {
                    if (identifiers.hasOwnProperty(key)) {
                        expectedResult = identifiers[key];
                        test.equal(pattern.write(pattern.allocate(), key),
                            expectedResult, key);
                    }
                }
            },

            function (test) {
                test.title("Keywords");
                var
                    pattern = new gpf.Pattern("if|else|then");
                test.equal(pattern.write(pattern.allocate(), "if"), 2, "if");
                test.equal(pattern.write(pattern.allocate(), "else"), 4,
                    "else");
                test.equal(pattern.write(pattern.allocate(), "then"), 4,
                    "then");
            }


        ]

    });

})(); /* End of privacy scope */