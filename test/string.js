"use strict";
/*global describe, it, assert*/

/*eslint-disable max-nested-callbacks*/

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
            assert(gpf.capitalize("éric") === "Éric");
        });

    });

    describe("gpf.replaceEx", function () {

        it("replaces strings recursively", function () {
            assert("abc" === gpf.replaceEx("abc", {
                "a": "abc",
                "b": "dc",
                "c": ""
            }));
        });

    });

    describe("gpf.escapeFor", function () {

        it("escapes for JavaScript", function () {
            assert("\"abc\\r\\ndef\"" === gpf.escapeFor("abc\r\ndef", "javascript"));
        });

        it("escapes for xml", function () {
            assert("&lt;a&amp;b&gt;" === gpf.escapeFor("<a&b>", "xml"));
        });

        it("escapes for html", function () {
            assert("&lt;a&amp;b:&eacute;&egrave;&ecirc;&aacute;&agrave;&gt;" === gpf.escapeFor("<a&b:éèêáà>", "html"));
        });
    });

    if (gpf.internals) {

    describe("Strings array", function () {

        var testCases = [{
            label: "too much",
            strings: ["a", "b", "c"],
            size: 2,
            count: 2,
            remaining: 0,
            expectedResult: "ab",
            expectedStrings: ["c"]
        }, {
            label: "matching",
            strings: ["a", "b", "c"],
            size: 3,
            count: 3,
            remaining: 0,
            expectedResult: "abc",
            expectedStrings: []
        }, {
            label: "not enough",
            strings: ["a", "b", "c"],
            size: 4,
            count: 3,
            remaining: 1,
            expectedResult: "abc",
            expectedStrings: []
        }, {
            label: "empty strings",
            strings: [],
            size: 3,
            count: 0,
            remaining: 3,
            expectedResult: "",
            expectedStrings: []
        }, {
            label: "split required",
            strings: ["abc", "def", "ghi"],
            size: 4,
            count: 1,
            remaining: 1,
            expectedResult: "abcd",
            expectedStrings: ["ef", "ghi"]

        }];

        describe("_gpfStringArrayCountToFit", function () {
            var _gpfStringArrayCountToFit = gpf.internals._gpfStringArrayCountToFit;

            testCases.forEach(function (testCase) {
                var label = "counts the number of parts needed to fit requested size (" + testCase.label + ")";
                it(label, function () {
                    var result = _gpfStringArrayCountToFit(testCase.strings, testCase.size);
                    assert(testCase.count === result.count);
                    assert(testCase.remaining === result.remaining);

                });
            });

        });

        describe("_gpfStringArraySplice", function () {
            var _gpfStringArraySplice = gpf.internals._gpfStringArraySplice;

            testCases.forEach(function (testCase) {
                var label = "splices the string array and return the concatenated result (" + testCase.label + ")";
                it(label, function () {
                    var clonedStrings = [].concat(testCase.strings),
                        result = _gpfStringArraySplice(clonedStrings, testCase.count, testCase.remaining);
                    assert(testCase.expectedResult === result);
                    assert(true === gpf.like(testCase.expectedStrings, clonedStrings));
                });
            });

        });

        describe("_gpfStringArrayExtract", function () {
            var _gpfStringArrayExtract = gpf.internals._gpfStringArrayExtract;

            testCases.forEach(function (testCase) {
                var label = "extracts a string from a string array (" + testCase.label + ")";
                it(label, function () {
                    var clonedStrings = [].concat(testCase.strings),
                        result = _gpfStringArrayExtract(clonedStrings, testCase.size);
                    assert(testCase.expectedResult === result);
                    assert(true === gpf.like(testCase.expectedStrings, clonedStrings));
                });
            });
        });

    });
}

});
