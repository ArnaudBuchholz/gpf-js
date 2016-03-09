(function () {/* Begin of privacy scope */
    "use strict";

    /*jshint -W027*/ // Done on purpose until gpf.declareTests is removed
    return;

    // TODO replace .apply with .call where appropriate

    var
        _TOKEN_ALLOWED_SYMBOLS = (
            "* *="
                + " / /="
                + " % %="
                + " ^ ^="
                + " ~ ~="

                + " + ++ +="
                + " - -- -="
                + " | || |="
                + " & && &="

                + " = == ==="
                + " ! != !=="
                + " > >> >= >>= >>> >>>="
                + " < << <= <<="

                + " [ ] ( ) { } . , ; ? :"
            ).split(" "),

        callback = function (event) {
            if (!this.count) {
                this.count = 1;
            } else {
                ++this.count;
            }
            this.type = event.type();
            this.token = event.get("token");
            this.pos = event.get("pos");
            this.line = event.get("line");
            this.column = event.get("column");
            if (this.tokens) {
                this.tokens.push(this.token);
            }
            if ("error" === event.type()) {
                this.log("tokenizer error: " + event.get("code") + " " +
                    event.get("message"));
            }
            if (this.stopAt && this.stopAt === this.count) {
                event.preventDefault(); // Should cancel
            }
        },

        check = function (test, expected) {
            var
                expectedCount = expected[0],
                expectedType = expected[1],
                expectedToken = expected[2],
                expectedPos = expected[3],
                expectedLine = expected[4],
                expectedColumn = expected[5],
                message = expected[6],
                result = expectedCount === test.count
                             && expectedType === test.type
                             && ( undefined === expectedToken
                                 || expectedToken === test.token )
                             && expectedPos === test.pos
                             && expectedLine === test.line
                             && expectedColumn === test.column;
            test.assert(result, test, message);
        }
        ;

    gpf.declareTests({

        "basic": [

            function (test) {
                test.title("Keyword");
                gpf.js.tokenize.apply(test, ["return", callback]);
                check(test, [1, "keyword", "return", 0, 0, 0, "Keyword found"]);
            },

            function (test) {
                test.title("Identifier with formatting");
                test.count = 0;
                gpf.js.tokenize.apply(test, ["\t\r\n _identifier92", callback]);
                check(test, [2, "identifier", "_identifier92", 4, 1, 1,
                    "Identifier found"]);
            },

            function (test) {
                test.title("String with spacing");
                test.log("\n\n\t\t\"1\\\"3\"");
                gpf.js.tokenize.apply(test, ["\n\n\t\t\"1\\\"3\"", callback]);
                check(test, [2, "string", "\"1\\\"3\"", 4, 2, 2,
                    "String found"]);
            },

            function (test) {
                test.title("Parsing of a string with error");
                gpf.js.tokenize.apply(test, ["\"1\n3\"", callback]);
                check(test, [1, "error", undefined, 0, 0, 0,
                    "String error found"]);
            },

            function (test) {
                test.title("Error ignore");
                gpf.js.tokenize.apply(test, ["\"1", callback]);
                check(test, [1, "error", undefined, 0, 0, 0,
                    "String error found"]);
            },

            function (test) {
                test.title("Error forcing");
                test.stopAt = 1;
                gpf.js.tokenize.apply(test, ["return this", callback]);
                check(test, [2, "error", undefined, 0, 0, 0,
                    "Error generated"]);
            }

        ],

        "advanced": [

            function (test) {
                test.title("Parsing of a keyword in several parts");
                var context = gpf.js.tokenizeEx.apply(test, ["ret", callback]);
                gpf.js.tokenizeEx.apply(test, ["urn", callback, context]);
                gpf.js.tokenizeEx.apply(test, [null, callback, context]);
                check(test, [1, "keyword", "return", 0, 0, 0,
                    "Chunks consolidated"]);
            }

        ],

        "symbols": [

            function (test) {
                test.title("Parsing of a keyword in several parts");
                gpf.js.tokenize.apply(test, [_TOKEN_ALLOWED_SYMBOLS.join(" "),
                    callback]);
                check(test, [97, "symbol", ":", 128, 0, 128,
                    "All symbols recognized"]);
            },

            function (test) {
                test.title("Check symbol parsing without separators");
                test.tokens = [];
                var context = gpf.js.tokenizeEx.apply(test, ["**=/", callback]);
                gpf.js.tokenizeEx.apply(test, ["[/=%%=^^=", callback, context]);
                gpf.js.tokenizeEx.apply(test, ["~~=+]+++=", callback, context]);
                gpf.js.tokenizeEx.apply(test, ["-(---=|)|", callback, context]);
                gpf.js.tokenizeEx.apply(test, ["||=&{&&&=", callback, context]);
                gpf.js.tokenizeEx.apply(test, ["=}==.===!", callback, context]);
                gpf.js.tokenizeEx.apply(test, ["!=!==>,>>", callback, context]);
                gpf.js.tokenizeEx.apply(test, [";>=>>=>>>", callback, context]);
                gpf.js.tokenizeEx.apply(test, ["?>>>=<:<<", callback, context]);
                gpf.js.tokenizeEx.apply(test, ["<=<<=", callback, context]);
                gpf.js.tokenizeEx.apply(test, [null, callback, context]);
                check(test, [49, "symbol", "<<=", 78, 0, 78,
                    "All symbols recognized"]);
            }

        ]

    });

})(); /* End of privacy scope */
