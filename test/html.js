(function () { /* Begin of privacy scope */
    "use strict";

    var
        _sampleHTML = [
            "<h1>Heading</h1>",
            "<h2>Sub-heading</h2>",
            "<p>Paragraphs are separated",
            "by a blank line.</p>",
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
            "<p>The rain&mdash;not the",
            "reign&mdash;in Spain.</p>"
        ].join(""),

        _sampleMD = [
            "# Heading",
            "",
            "## Sub-heading",
            "",
            "Paragraphs are separated",
            "by a blank line.",
            "",
            "Text attributes *italic*, ",
            "**bold**, `monospace`.",
            "",
            "A [link](http://example.com).",
            "<<<   No space between ] and (  >>>",
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
        ].join("\r\n"),

        _sampleHTMLobj = {
            h1: "Heading",
            h2: "Sub-heading",
            p:[
                "Paragraphs are separated by a blank line.",
                {
                    $: "Text attributes ",
                    em: "italic",
                    $$1: ", ",
                    b: "bold",
                    $$2: ", ",
                    code: "monospace",
                    $$3: "."
                },
                {
                    $: "A ",
                    a: {
                        href: "http://example.com",
                        $: "link"
                    },
                    $$1: "."
                },
                "Shopping list:"
            ],
            ul: {
                li: [
                    "apples",
                    "oranges",
                    "pears"
                ]
            },
            p$1: "Numbered list:",
            ol: {
                li: [
                    "apples",
                    "oranges",
                    "pears"
                ]
            },
            p$2: {
                $: "The rain",

                $$1: "not the reign",

                $$2: "in Spain."
            }

        };

    gpf.declareTests({

        "MarkdownConverter": [

            function (test) {
                test.title("Direct use of MarkdownConverter parser");
                var parser = new gpf.html.MarkdownParser();
                parser.parse(_sampleMD);
                // TODO determine how the output should be handled
            }

        ]

    });

})(); /* End of privacy scope */
