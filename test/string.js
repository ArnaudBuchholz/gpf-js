"use strict";
/*global describe, it, assert*/

describe("string", function () {

    describe("gpf.capitalize", function () {

        it("does nothing on empty string", function () {
            assert(gpf.capitalize("") === "");
        });

        it("uppercases the first letter", function () {
            assert(gpf.capitalize("word") === "Word");
            assert(gpf.capitalize("two words") === "Two words");
            assert(gpf.capitalize("Two words") === "Two words");
        });

        it("also handles accents", function () {
            assert(gpf.capitalize("éric"), "Éric");
        });

    });

});

/*
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
                test.equal(gpf.escapeFor("abc\r\ndef", "javascript"),
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

*/