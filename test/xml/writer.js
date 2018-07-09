"use strict";

describe("xml/writer", function () {

    // Simplify the writing of the tests, may be productized by a generic interface wrapper
    function wrap (writer, promise) {
        var wrapped = promise;
        [
            "characters",
            "endDocument",
            "endElement",
            "endPrefixMapping",
            "processingInstruction",
            "startDocument",
            "startElement",
            "startPrefixMapping"
        ].forEach(function (apiName) {
            wrapped[apiName] = function () {
                var args = arguments;
                return wrap(writer, promise.then(function () {
                    return writer[apiName].apply(writer, args);
                }));
            };
        });
        return wrapped;
    }

    function allocateWriter (done, checkResult) {
        var writer = new gpf.xml.Writer(),
            output = new gpf.stream.WritableString();
        gpf.stream.pipe(writer, output).then(function () {
            try {
                checkResult(output.toString());
                done();
            } catch (error) {
                done(error);
            }
        });
        return wrap(writer, Promise.resolve());
    }

    it("implements gpf.interfaces.IXmlContentHandler", function () {
        assert(gpf.interfaces.isImplementedBy(gpf.interfaces.IXmlContentHandler, gpf.xml.Writer));
    });

    it("can be piped", function (done) {
        allocateWriter(done, function (output) {
            assert(output === "<document/>");
        })
            .startDocument()
            .startElement("document")
            .endElement()
            .endDocument()["catch"](done);
    });

    it("allows processing instructions", function (done) {
        allocateWriter(done, function (output) {
            assert(output === "<?test test-data?>\n<document/>");
        })
            .startDocument()
            .processingInstruction("test", "test-data")
            .startElement("document")
            .endElement()
            .endDocument()["catch"](done);
    });

    it("supports attributes (string value)", function (done) {
        allocateWriter(done, function (output) {
            assert(output === "<document test=\"value\"/>");
        })
            .startDocument()
            .startElement("document", {
                "test": "value"
            })
            .endElement()
            .endDocument()["catch"](done);
    });

    it("supports attributes (number value)", function (done) {
        allocateWriter(done, function (output) {
            assert(output === "<document test=\"2\"/>");
        })
            .startDocument()
            .startElement("document", {
                "test": 2
            })
            .endElement()
            .endDocument()["catch"](done);
    });

    it("supports multiple attributes", function (done) {
        allocateWriter(done, function (output) {
            // Order of attributes is *not* significant
            assert(output === "<document test1=\"value1\" test2=\"value2\"/>"
                || output === "<document test2=\"value2\" test1=\"value1\"/>");
        })
            .startDocument()
            .startElement("document", {
                "test1": "value1",
                "test2": "value2"
            })
            .endElement()
            .endDocument()["catch"](done);
    });

    it("supports nodes hierarchy", function (done) {
        allocateWriter(done, function (output) {
            assert(output === "<document><a><b/></a><c/></document>");
        })
            .startDocument()
            .startElement("document")
            .startElement("a")
            .startElement("b")
            .endElement()
            .endElement()
            .startElement("c")
            .endElement()
            .endElement()
            .endDocument()["catch"](done);
    });

    it("escapes attributes value", function (done) {
        allocateWriter(done, function (output) {
            assert(output === "<document test=\"&lt;&amp;&gt;\"/>");
        })
            .startDocument()
            .startElement("document", {
                test: "<&>"
            })
            .endElement()
            .endDocument()["catch"](done);
    });

    it("escapes text value", function (done) {
        allocateWriter(done, function (output) {
            assert(output === "<document>&lt;&amp;&gt;</document>");
        })
            .startDocument()
            .startElement("document")
            .characters("<&>")
            .endElement()
            .endDocument()["catch"](done);
    });

});
