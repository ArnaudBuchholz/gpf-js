"use strict";

describe("xml/writer", function () {

    // Simplify the writing of the tests, may be productized by a generic interface wrapper
    function wrap (writer, promise) {
        var wrapped = Object.create(promise);
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
                promise.then(function () {
                    return wrap(writer, writer.call(writer, args));
                });
            };
        });
        return wrapped;
    }

    function allocateWriter (done) {
        var writer = new gpf.xml.Writer(),
            output = new gpf.stream.WritableString();
        gpf.stream.pipe(writer, output).then(function () {
            done(output.toString());
        });
        return wrap(writer, Promise.resolve());
    }

    it ("implements gpf.interfaces.IXmlContentHandler", function () {
        assert(gpf.interfaces.isImplementedBy(gpf.interfaces.IXmlContentHandler, gpf.xml.Writer));
    });

    it("can be piped", function (done) {
        allocateWriter(function (output) {
            assert(output === "<document/>");
            done();
        })
            .startDocument()
            .startElement("document")
            .endElement()
            .endDocument()["catch"](done);
    });

    it("allows processing instructions", function (done) {
        allocateWriter(function (output) {
            assert(output === "<?test test-data?>\n<document/>");
            done();
        })
            .startDocument()
            .processingInstruction("test", "test-data")
            .startElement("document")
            .endElement()
            .endDocument()["catch"](done);
    });

    it("supports attributes (string value)", function (done) {
        allocateWriter(function (output) {
            assert(output === "<document test=\"value\"/>");
            done();
        })
            .startDocument()
            .startElement("document", {
                "test": "value"
            })
            .endElement()
            .endDocument()["catch"](done);
    });

    it("supports attributes (number value)", function (done) {
        allocateWriter(function (output) {
            assert(output === "<document test=\"2\"/>");
            done();
        })
            .startDocument()
            .startElement("document", {
                "test": 2
            })
            .endElement()
            .endDocument()["catch"](done);
    });

    it("supports multiple attributes", function (done) {
        allocateWriter(function (output) {
            // Order of attributes is *not* significant
            assert(output === "<document test1=\"value1\" test2=\"value2\"/>"
                || output === "<document test2=\"value2\" test1=\"value1\"/>");
            done();
        })
            .startDocument()
            .startElement("document", "", {
                "test1": "value1",
                "test2": "value2"
            })
            .endElement()
            .endDocument()["catch"](done);
    });

    it("supports nodes hierarchy", function (done) {
        allocateWriter(function (output) {
            assert(output === "<document><a><b/></a><c/></document>");
            done();
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

});
