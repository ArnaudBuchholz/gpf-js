"use strict";

describe("string/escapefor", function () {

    if (gpf.internals) {

        describe("(internal) _gpfStringEscapeFor", function () {
            var _gpfStringEscapeFor = gpf.internals._gpfStringEscapeFor;

            it("escapes for JavaScript", function () {
                assert("\"abc\\r\\ndef\"" === _gpfStringEscapeFor("abc\r\ndef", "javascript"));
            });

            it("escapes for xml", function () {
                assert("&lt;a&amp;b&gt;" === _gpfStringEscapeFor("<a&b>", "xml"));
            });

            it("escapes for html", function () {
                assert("&lt;a&amp;b:&eacute;&egrave;&ecirc;&aacute;&agrave;&gt;"
                    === _gpfStringEscapeFor("<a&b:\u00E9\u00E8\u00EA\u00E1\u00E0>", "html"));
            });

        });

    }

});
