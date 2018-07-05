"use strict";

describe("xml/writer", function () {

    function allocateWriter (done) {
        var writer = new gpf.xml.Writer(),
            output = new gpf.stream.WritableString();
        gpf.stream.pipe(writer, output).then(function () {
            done(output.toString());
        });
        return writer;
    }

    it("can be piped", function (done) {
        var writer = allocateWriter(function (output) {
            assert(output === "<document/>");
            done();
        });
        writer.startDocument().then(function () {
            return writer.startElement("document");
        }).then(function () {
            return writer.endElement();
        }).then(function () {
            return writer.endDocument();
        });
    });

    it("allows processing instructions", function (done) {
        var writer = allocateWriter(function (output) {
            assert(output === "<?test test-data?>\n<document/>");
            done();
        });
        writer.startDocument().then(function () {
            return writer.processingInstruction("test", "test-data");
        }).then(function () {
            return writer.startElement("document");
        }).then(function () {
            return writer.endElement();
        }).then(function () {
            return writer.endDocument();
        });
    });

    it("supports attributes", function (done) {
        var writer = allocateWriter(function (output) {
            assert(output === "<document test=\"value\"/>");
            done();
        });
        writer.startDocument().then(function () {
            return writer.startElement("document", {
                "test": "value"
            });
        }).then(function () {
            return writer.endElement();
        }).then(function () {
            return writer.endDocument();
        });
    });

    it("supports attributes", function (done) {
        var writer = allocateWriter(function (output) {
            // Order of attributes is *not* significant
            assert(output === "<document test1=\"value1\" test2=\"value2\"/>"
                || output === "<document test2=\"value2\" test1=\"value1\"/>");
            done();
        });
        writer.startDocument().then(function () {
            return writer.startElement("document", "", {
                "test1": "value1",
                "test2": "value2"
            });
        }).then(function () {
            return writer.endElement();
        }).then(function () {
            return writer.endDocument();
        });
    });

    it("supports nodes hierarchy", function (done) {
        var writer = allocateWriter(function (output) {
            assert(output === "<document><a><b/></a><c/></document>");
            done();
        });
        writer.startDocument().then(function () {
            return writer.startElement("document");
        }).then(function () {
            return writer.startElement("a");
        }).then(function () {
            return writer.startElement("b");
        }).then(function () {
            return writer.endElement();
        }).then(function () {
            return writer.endElement();
        }).then(function () {
            return writer.startElement("c");
        }).then(function () {
            return writer.endElement();
        }).then(function () {
            return writer.endElement();
        }).then(function () {
            return writer.endDocument();
        });
    });

});
