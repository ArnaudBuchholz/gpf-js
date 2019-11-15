"use strict";

describe("xml/parser", function () {

    function ignore () {
    }

    var XmlContentTester = gpf.define({
        $class: "XmlContentTester",

        characters: function (data) {
            return this._check({
                api: "characters",
                data: data
            });
        },
        endDocument: function () {
            return this._check({
                api: "endDocument"
            });
        },
        endElement: function () {
            return this._check({
                api: "endElement"
            });
        },
        endPrefixMapping: function (prefix) {
            return this._check({
                api: "endPrefixMapping",
                prefix: prefix
            });
        },
        processingInstruction: function (target, data) {
            return this._check({
                api: "processingInstruction",
                target: target,
                data: data
            });
        },
        startDocument: function () {
            return this._check({
                api: "startDocument"
            });
        },
        startElement: function (qName, attributes) {
            return this._check({
                api: "startElement",
                qName: qName,
                attributes: attributes
            });
        },
        startPrefixMapping: function (prefix, uri) {
            return this._check({
                api: "startPrefixMapping",
                prefix: prefix,
                uri: uri
            });
        },

        _check: function (received) {
            if (!this._expected) {
                return Promise.resolve(); // ignore
            }
            var expected = this._expected[this._step++];
            if (!expected) {
                return Promise.reject("No more call expected");
            }
            Object.keys(expected)
                .sort() // api will be first
                .forEach(function (name) {
                    var expectedValue = expected[name],
                        receivedValue = received[name],
                        expectedNameType = typeof expectedValue;
                    if (expectedNameType !== typeof receivedValue) {
                        throw new Error("Invalid member type '" + name + "'");
                    }
                    if (expectedNameType === "object") {
                        var expectedAttributes = Object.keys(expectedValue),
                            receivedAttributes = Object.keys(receivedValue);
                        if (expectedAttributes.join(",") !== receivedAttributes.join(",")) {
                            throw new Error("Incompatible number of keys for " + name + " '"
                                + receivedAttributes.join(",") + "', expected '"
                                + expectedAttributes.join(",") + "'");
                        }
                        expectedAttributes.forEach(function (attribute) {
                            if (expectedValue[attribute] !== receivedValue[attribute]) {
                                throw new Error("Unexpected attribute " + attribute + " of " + name + " '"
                                + receivedValue[attribute] + "', expected '" + expectedValue[attribute] + "'");
                            }
                        });
                    } else if (expected[name] !== received[name]) {
                        throw new Error("Unexpected " + name + " '" + receivedValue
                            + "', expected '" + expectedValue + "'");
                    }
                });
            return Promise.resolve();
        },

        isSynchronous: function () {
            return this._synchronous;
        },

        assertIfCompleted: function () {
            if (this._expected && this._step !== this._expected.length) {
                throw new Error("Output not completed");
            }
        },

        // when expected is false, nothing is expected: i.e. it should fail with InvalidXMLSyntax
        constructor: function (synchronous, expected) {
            this._synchronous = synchronous;
            this._expected = expected;
            this._step = 0;
        }
    });

    function createTests (synchronous) {

        function createTest (xml, expected) {
            var verb;
            if (expected) {
                verb = "parses";
            } else {
                verb = "fails for";
            }
            it(verb + " '" + xml + "'", function (done) {
                function wrappedDone (error) {
                    if (expected) {
                        done(error);
                    } else {
                        try {
                            assert(error && error instanceof gpf.Error.InvalidXmlSyntax);
                            done();
                        } catch (exception) {
                            done(exception);
                        }
                    }
                }

                var xmlOutput = new XmlContentTester(synchronous, expected),
                    xmlParser = new gpf.xml.Parser(xmlOutput),
                    inputStream;
                if (synchronous) {
                    try {
                        xmlParser.write(xml);
                        xmlParser.flush();
                        xmlOutput.assertIfCompleted();
                        wrappedDone();
                    } catch (e) {
                        wrappedDone(e);
                    }
                } else {
                    inputStream = new gpf.stream.ReadableString(xml);
                    gpf.stream.pipe(inputStream, xmlParser).then(wrappedDone, wrappedDone);
                }
            });
        }

        describe("simple use case", function () {
            createTest("<html />", [{
                api: "startDocument"
            }, {
                api: "startElement",
                qName: "html",
                attributes: {}
            }, {
                api: "endElement"
            }, {
                api: "endDocument"
            }]);

            createTest("<html style=\"border: 1px;\"/>", [{
                api: "startDocument"
            }, {
                api: "startElement",
                qName: "html",
                attributes: {
                    style: "border: 1px;"
                }
            }, {
                api: "endElement"
            }, {
                api: "endDocument"
            }]);

            createTest("<html><head /><body><h1>Hello</h1></body></html>", [{
                api: "startDocument"
            }, {
                api: "startElement",
                qName: "html",
                attributes: {}
            }, {
                api: "startElement",
                qName: "head",
                attributes: {}
            }, {
                api: "endElement"
            }, {
                api: "startElement",
                qName: "body",
                attributes: {}
            }, {
                api: "startElement",
                qName: "h1",
                attributes: {}
            }, {
                api: "characters",
                data: "Hello"
            }, {
                api: "endElement"
            }, {
                api: "endElement"
            }, {
                api: "endElement"
            }, {
                api: "endDocument"
            }]);

            createTest("<!-- This is a comment -->", [{
                api: "startDocument"
            }, { // Comments are ignored
                api: "endDocument"
            }]);

            createTest("<?xml version=\"1.0\"?>\n"
                + "<edmx:Edmx\n"
                + "    Version=\"1.0\"\n"
                + "    xmlns:edmx=\"http://schemas.microsoft.com/ado/2007/06/edmx\"\n"
                + "    xmlns=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\""
                + "/>", [{
                api: "startDocument"
            }, {
                api: "processingInstruction",
                target: "xml",
                data: "version=\"1.0\""
            }, {
                api: "startPrefixMapping",
                prefix: "edmx",
                uri: "http://schemas.microsoft.com/ado/2007/06/edmx"
            }, {
                api: "startPrefixMapping",
                prefix: "",
                uri: "http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"
            }, {
                api: "startElement",
                qName: "edmx:Edmx",
                attributes: {Version: "1.0"}
            }, {
                api: "endElement"
            }, {
                api: "endPrefixMapping",
                prefix: ""
            }, {
                api: "endPrefixMapping",
                prefix: "edmx"
            }, {
                api: "endDocument"
            }]);

            createTest("<script language='javascript'>require(\"gpf/test/sample.js\");</script>", [{
                api: "startDocument"
            }, {
                api: "startElement",
                qName: "script",
                attributes: {
                    language: "javascript"
                }
            }, {
                api: "characters",
                data: "require(\"gpf/test/sample.js\");"
            }, {
                api: "endElement"
            }, {
                api: "endDocument"
            }]);

            createTest("<h1>Hello/World/</h1>", [{
                api: "startDocument"
            }, {
                api: "startElement",
                qName: "h1",
                attributes: {}
            }, {
                api: "characters",
                data: "Hello/World/"
            }, {
                api: "endElement"
            }, {
                api: "endDocument"
            }]);
        });

        describe("syntax validation", function () {
            createTest("<not.closed", false);
            createTest("<tag></not.matching.tag>", false);
            createTest("<tag><not.closed></tag>", false);
            createTest("<invalid tag />", false);
            createTest("<tag attributeNotValid=value />", false);
            createTest("<tag attributeNotClosed=\"value />", false);
            createTest("<tag attributeNotClosed='value />", false);
            createTest("<tag attributeNotClosed='value\" />", false);
            createTest("<tag attributeNotClosed=\"value' />", false);
            createTest("<tag duplicate='1' duplicate='2' />", false);
            createTest("<p2:invalidNamespace xmlns:p1='1' />", false);
            createTest("<invalidNamespace xmlns:p1='1'><p2:test /></invalidNamespace>", false);
            createTest("<invalidNamespace xmlns:p1='1' p2:test='0' />", false);
        });
    }

    describe("asynchronous", function () {
        describe("creation", function () {
            it("validates the IXmlContentHandler interface", function () {
                var exceptionCaught;
                try {
                    var xmlParser = new gpf.xml.Parser({});
                    xmlParser.assertIfCompleted();
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.InterfaceExpected);
            });

            it("is asynchronous when the IXmlContentHandler is (without ISynchronousable)", function () {
                var xmlParser = new gpf.xml.Parser({
                    characters: function (data) {
                        ignore(data);
                    },
                    endDocument: function () {},
                    endElement: function () {},
                    endPrefixMapping: function (prefix) {
                        ignore(prefix);
                    },
                    processingInstruction: function (target, data) {
                        ignore(target, data);
                    },
                    startDocument: function () {},
                    startElement: function (qName, attributes) {
                        ignore(qName, attributes);
                    },
                    startPrefixMapping: function (prefix, uri) {
                        ignore(prefix, uri);
                    }
                });
                assert(!xmlParser.isSynchronous());
            });

            it("is asynchronous when the IXmlContentHandler is (with ISynchronousable)", function () {
                var xmlParser = new gpf.xml.Parser(new XmlContentTester(false, []));
                assert(!xmlParser.isSynchronous());
            });
        });

        createTests(false);
    });

    describe("synchronous", function () {
        describe("creation", function () {
            it("is asynchronous when the IXmlContentHandler is (with ISynchronousable)", function () {
                var xmlParser = new gpf.xml.Parser(new XmlContentTester(true, []));
                assert(xmlParser.isSynchronous());
            });
        });

        createTests(true);
    });

});
