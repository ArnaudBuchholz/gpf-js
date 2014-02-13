(function () { /* Begin of privacy scope */
    "use strict";

    gpf.declareTests({

        "replaceEx": [

            function (test) {
                test.equal(gpf.replaceEx("abc", {
                    "a": "abc",
                    "b": "dc",
                    "c": ""
                }), "add", "OK");
            }

        ],

        "escapeFor": [

            function (test) {
                test.equal(gpf.escapeFor("abc\r\ndef", "jscript"),
                    "\"abc\\r\\ndef\"", "OK");
            },

            function (test) {
                test.equal(gpf.escapeFor("<a&b>", "xml"),
                    "&lt;a&amp;b&gt;", "OK");
            },

            function (test) {
                test.equal(gpf.escapeFor("<a&b:éèêáà>", "html"),
                "&lt;a&amp;b:&eacute;&egrave;&ecirc;&aacute;&agrave;&gt;",
                    "OK");
            }
        ]


    });

})();
/* End of privacy scope */
