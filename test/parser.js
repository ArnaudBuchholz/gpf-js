(function () { /* Begin of privacy scope */
    "use strict";

    var
        _patterns = {
            identifiers: {
                _expression: "[_a-zA-Z][_a-zA-Z0-9]*",
                "abc": 3,
                "abc!": 3,
                "0123": -1,
                "_ABcD_0": 7
            }
        };

    function write(context, chars) {
        var
            idx,
            len = chars.length,
            res;
        for(idx = 0; idx < len; ++idx) {
            res = context.write(chars.charAt(idx));
        }
        return res;
    }

    gpf.declareTests({

        pattern: [

            function (test) {
                test.title("Simple expressions");
                var
                    pattern = new gpf.Pattern("abc"),
                    ctx1, ctx2, ctx3;
                // First verify that failure works
                ctx1 = pattern.allocate();
                test.equal(write(ctx1, "a"), 0, "Need more input");
                test.equal(write(ctx1, "b"), 0, "Need more input");
                test.equal(write(ctx1, "d"), -1, "No chance of matching");
                test.equal(write(ctx1, "c"), -1,
                    "Not even after sending the right character");
                // Then verify that matching works
                ctx2 = pattern.allocate();
                test.equal(write(ctx2, "ab"), 0, "Need more input");
                test.equal(write(ctx2, "c"), 3,
                    "Matching with the correct length");
                test.equal(write(ctx2, "d"), 3,
                    "Any other char doesn't change the result");
                // Check that immediate match works
                ctx3 = pattern.allocate();
                test.equal(write(ctx3, "abcd"), 3,
                    "The first 3 chars are matching");
            },

            function (test) {
                test.title("Range");
                var
                    pattern = new gpf.Pattern("[a-zA-Z^d-fJ]"),
                    ctx1, ctx2, ctx3;
                ctx1 = pattern.allocate();
                test.equal(write(ctx1, "L"), 1, "Match");
                ctx2 = pattern.allocate();
                test.equal(write(ctx2, "e"), -1, "Not match");
                ctx3 = pattern.allocate();
                test.equal(write(ctx2, "0"), -1, "Not match");
            },

            function (test) {
                test.title("Alternative");
                var
                    pattern = new gpf.Pattern("if|else|then");
                test.equal(pattern.allocate().write("if"), 2, "if");
                test.equal(pattern.allocate().write("else"), 4, "else");
                test.equal(pattern.allocate().write("then"), 4, "then");
            },

            function (test) {
                test.title("Advanced expressions");
                var
                    name,
                    patternTest,
                    pattern,
                    testExpr;
                for (name in _patterns) {
                    if (_patterns.hasOwnProperty(name)) {
                        patternTest = _patterns[name];
                        test.log(name);
                        pattern = new gpf.Pattern(patternTest._expression);
                        for (testExpr in patternTest) {
                            if (patternTest.hasOwnProperty(testExpr)) {
                                if (patternTest === "_expression") {
                                    continue;
                                }
                                test.equal(write(pattern.allocate(), testExpr),
                                    patternTest[testExpr], "\t" + testExpr);
                            }
                        }
                    }
                }
            }

        ]

    });

})(); /* End of privacy scope */