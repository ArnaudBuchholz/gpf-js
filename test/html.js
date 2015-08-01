(function () { /* Begin of privacy scope */
    "use strict";

    /*jshint -W027*/ // Done on purpose until gpf.declareTests is removed
    return;

    var
        _sampleHTML = [
            "<h1>Heading</h1>",
            "<h2>Sub-heading</h2>",
            "<p>Paragraphs are separated by a blank line.</p>",
            "<p>Text attributes <em>italic</em>, ",
            "<strong>bold</strong>, ",
            "<code>monospace</code>.</p>",
            "<p>A <a href=\"http://example.com\">link</a>.</p>",
            "<p>Shopping list:</p>",
            "<ul>",
            "<li>apples</li>",
            "<li>oranges</li>",
            "<li>pears</li>",
            "</ul>",
            "<p>Numbered list:</p>",
            "<ol>",
            "<li>apples</li>",
            "<li>oranges</li>",
            "<li>pears</li>",
            "</ol>",
            "<p>The rain&mdash;not the reign&mdash;in Spain.</p>"
        ].join(""),

        _sampleMD = [
            "# Heading",
            "",
            "## Sub-heading",
            "",
            "Paragraphs are separated",
            "by a blank line.",
            "",
            "Text attributes *italic*,",
            "**bold**, `monospace`.",
            "",
            "A [link](http://example.com).",
            "",
            "Shopping list:",
            "",
            "* apples",
            "* oranges",
            "* pears",
            "",
            "Numbered list:",
            "",
            "1. apples",
            "2. oranges",
            "3. pears",
            "",
            "The rain---not the reign---in",
            "Spain."
        ].join("\r\n");

//        _sampleHTMLobj = {
//            h1: "Heading",
//            h2: "Sub-heading",
//            p:[
//                "Paragraphs are separated by a blank line.",
//                {
//                    $: "Text attributes ",
//                    em: "italic",
//                    $$1: ", ",
//                    b: "bold",
//                    $$2: ", ",
//                    code: "monospace",
//                    $$3: "."
//                },
//                {
//                    $: "A ",
//                    a: {
//                        href: "http://example.com",
//                        $: "link"
//                    },
//                    $$1: "."
//                },
//                "Shopping list:"
//            ],
//            ul: {
//                li: [
//                    "apples",
//                    "oranges",
//                    "pears"
//                ]
//            },
//            p$1: "Numbered list:",
//            ol: {
//                li: [
//                    "apples",
//                    "oranges",
//                    "pears"
//                ]
//            },
//            p$2: {
//                $: "The rain",
//
//                $$1: "not the reign",
//
//                $$2: "in Spain."
//            }
//
//        }

    gpf.declareTests({

        "MarkdownConverter": [

            function (test) {
                test.title("Direct use of MarkdownConverter parser");
                var
                    parser = new gpf.html.MarkdownParser(),
                    output = [];
                parser.setOutputHandler(output);
                parser.parse(_sampleMD, gpf.Parser.FINALIZE);
                test.equal(_sampleHTML, output.join(""), "Direct parsing");
            },

            function (test) {
                test.title("Streamed MarkdownConverter parser");
                var
                    parser = new gpf.html.MarkdownParser(),
                    stream = new gpf.ParserStream(parser,
                        gpf.stringToStream(_sampleMD));
                test.wait();
                gpf.stringFromStream(stream, function (event) {
                    var result;
                    test.equal(event.type(),
                        gpf.interfaces.IReadableStream.EVENT_DATA,
                        "Stream is ready");
                    result = event.get("buffer");
                    test.equal(_sampleHTML, result, "Streamed parsing");
                    test.done();
                });
            },

            // https://github.com/ArnaudBuchholz/gpf-js/issues/33
            function (test) {
                test.title("Issue #33");
                var
                    string = [
                        "A [link](ht",
                        "",
                        "tp://exa",
                        "mple.com)"
                    ].join("\r\n"),
                    parser = new gpf.html.MarkdownParser(),
                    stream = new gpf.ParserStream(parser,
                        gpf.stringToStream(string));
                test.wait();
                gpf.stringFromStream(stream, function (event) {
                    var result;
                    test.equal(event.type(),
                        gpf.interfaces.IReadableStream.EVENT_DATA,
                        "Stream is ready");
                    result = event.get("buffer");
                    test.equal("http://example.com", result.split("\"")[1],
                        "URL is correct");
                    test.done();
                });
            },

            // https://github.com/ArnaudBuchholz/gpf-js/issues/35
            function (test) {
                test.title("Issue #33");
                var
                    parser = new gpf.html.MarkdownParser(),
                    stream = new gpf.ParserStream(parser,
                        gpf.stringToStream("`&lt;path&gt;`"));
                test.wait();
                gpf.stringFromStream(stream, function (event) {
                    var result;
                    test.equal(event.type(),
                        gpf.interfaces.IReadableStream.EVENT_DATA,
                        "Stream is ready");
                    result = event.get("buffer");
                    test.equal("<p><code>&lt;path&gt;</code></p>", result,
                        "HTML is correct");
                    test.done();
                });
            }

        ]

    });

    if (gpf.HOST_BROWSER === gpf.host()) {

        gpf.declareTests({

            "Responsive": [

                function (test) {
                    test.title("Install responsive framework");
                    gpf.html.responsive();
                    test.wait();
                    setTimeout(function () {
                        var body = document.body;
                        test.assert(gpf.html.hasClass(body, "gpf-portrait")
                            || gpf.html.hasClass(body, "gpf-landscape"),
                            "Body class altered");
                        test.done();
                    }, 0);
                }

            ]

        });

    }

})(); /* End of privacy scope */
