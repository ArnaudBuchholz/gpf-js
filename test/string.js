"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

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
            assert("add" === gpf.replaceEx("abc", {
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

    describe("gpf.stringToStream", function () {

        it("supports writing", function (done) {
            var stream = gpf.stringToStream(""),
                iWritableStream = gpf.interfaces.query(stream, gpf.interfaces.IWritableStream);
            assert(null !== iWritableStream);
            gpf.events.getPromiseHandler(function (eventHandler) {
                iWritableStream.write("abc", eventHandler);
            })
                .then(function (event) {
                    assert(gpf.events.EVENT_READY === event.type);
                    return gpf.events.getPromiseHandler(function (eventHandler) {
                        iWritableStream.write("def", eventHandler);
                    });
                })
                .then(function (event) {
                    assert(gpf.events.EVENT_READY === event.type);
                    assert("abcdef" === stream.toString());
                    done();

                })["catch"](function (reason) {
                    done(reason);
                });
        });

        it("supports reading", function (done) {
            var stream = gpf.stringToStream("abcdef"),
                iReadableStream = gpf.interfaces.query(stream, gpf.interfaces.IReadableStream);
            assert(null !== iReadableStream);
            gpf.events.getPromiseHandler(function (eventHandler) {
                iReadableStream.read(3, eventHandler);
            })
                .then(function (event) {
                    assert(gpf.events.EVENT_DATA === event.type);
                    var buffer = event.get("buffer");
                    assert("string" === typeof buffer);
                    assert(3 === buffer.length);
                    assert("abc" === buffer);
                    return gpf.events.getPromiseHandler(function (eventHandler) {
                        iReadableStream.read(2, eventHandler);
                    });
                })
                .then(function (event) {
                    assert(gpf.events.EVENT_DATA === event.type);
                    var buffer = event.get("buffer");
                    assert("string" === typeof buffer);
                    assert(2 === buffer.length);
                    assert("de" === buffer);
                    return gpf.events.getPromiseHandler(function (eventHandler) {
                        iReadableStream.read(100, eventHandler);
                    });
                })
                .then(function (event) {
                    assert(gpf.events.EVENT_DATA === event.type);
                    var buffer = event.get("buffer");
                    assert("string" === typeof buffer);
                    assert(1 === buffer.length);
                    assert("f" === buffer);
                    return gpf.events.getPromiseHandler(function (eventHandler) {
                        iReadableStream.read(100, eventHandler);
                    });
                })
                .then(function (event) {
                    assert(gpf.events.EVENT_END_OF_DATA === event.type);
                    done();

                })["catch"](function (reason) {
                    done(reason);
                });
        });

        it("supports reading and writing", function (done) {
            var stream = gpf.stringToStream("abcdef"),
                iWritableStream = gpf.interfaces.query(stream, gpf.interfaces.IWritableStream),
                iReadableStream = gpf.interfaces.query(stream, gpf.interfaces.IReadableStream);
            gpf.events.getPromiseHandler(function (eventHandler) {
                iWritableStream.write("ghi", eventHandler);
            })
                .then(function () {
                    return gpf.events.getPromiseHandler(function (eventHandler) {
                        iReadableStream.read(7, eventHandler);
                    });
                })
                .then(function (event) {
                    var buffer = event.get("buffer");
                    assert("string" === typeof buffer);
                    assert(7 === buffer.length);
                    assert("abcdefg" === buffer);
                    return gpf.events.getPromiseHandler(function (eventHandler) {
                        iWritableStream.write("k", eventHandler);
                    });
                })
                .then(function () {
                    return gpf.events.getPromiseHandler(function (eventHandler) {
                        iReadableStream.read(3, eventHandler);
                    });
                })
                .then(function (event) {
                    var buffer = event.get("buffer");
                    assert("string" === typeof buffer);
                    assert(3 === buffer.length);
                    assert("hik" === buffer);
                    done();

                })["catch"](function (reason) {
                    done(reason);
                });
        });

    });

    describe("gpf.stringFromStream", function () {

        it("converts immediately a StringStream to string", function (done) {
            var string = "abcdef",
                stream = gpf.stringToStream(string);
            gpf.events.getPromiseHandler(function (eventHandler) {
                gpf.stringFromStream(stream, eventHandler);
            })
                .then(function (event) {
                    assert(gpf.events.EVENT_READY === event.type);
                    assert(string === event.get("buffer"));
                    done();

                })["catch"](function (reason) {
                    done(reason);
                });
        });

        it("fills a string by reading a stream", function (done) {
            var string = "abcdef",
                stream = {
                    pos: 0,
                    read: function (count, eventsHandler) {
                        var result;
                        if (this.pos === string.length) {
                            gpf.events.fire.apply(this, [gpf.events.EVENT_END_OF_DATA, {}, eventsHandler]);
                        } else {
                            result = string.charAt(this.pos++);
                            gpf.events.fire.apply(this, [gpf.events.EVENT_DATA, {buffer: result}, eventsHandler]);
                        }
                    }
                };
            gpf.events.getPromiseHandler(function (eventHandler) {
                gpf.stringFromStream(stream, eventHandler);
            })
            .then(function (event) {
                assert(gpf.events.EVENT_READY === event.type);
                assert(string === event.get("buffer"));
                done();

            })["catch"](function (reason) {
                done(reason);
            });
        });

        it("forwards errors", function (done) {
            var stream = {
                pos: 0,
                read: function (count, eventsHandler) {
                    if (0 === this.pos) {
                        ++this.pos;
                        gpf.events.fire.apply(this, [gpf.events.EVENT_DATA, {buffer: "abc"}, eventsHandler]);
                    } else {
                        gpf.events.fire.apply(this, [gpf.events.EVENT_ERROR, {error: "KO"}, eventsHandler]);
                    }
                }
            };
            gpf.events.getPromiseHandler(function (eventHandler) {
                gpf.stringFromStream(stream, eventHandler);
            })
                .then(function (/*event*/) {
                    done("Not supposed to work");

                })["catch"](function (reason) {
                    assert("KO" === reason);
                    done();
                });
        });

    });

    describe("gpf.stream.pipe", function () {

        it("accepts a chunk size", function (done) {
            var readable = gpf.stringToStream("abcdef"),
                writable = gpf.stringToStream();
            gpf.events.getPromiseHandler(function (eventHandler) {
                gpf.stream.pipe({
                    readable: readable,
                    writable: writable,
                    chunkSize: 1
                }, eventHandler);
            })
                .then(function (event) {
                    assert(gpf.events.EVENT_READY === event.type);
                    assert("abcdef" === writable.toString());
                    done();

                })["catch"](function (reason) {
                    done(reason);
                });
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
