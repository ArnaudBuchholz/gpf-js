"use strict";

describe("xml/writer", function () {

    it("can be piped", function (done) {
        var writer = new gpf.xml.Writer(),
            output = new gpf.stream.WritableString();
        gpf.stream.pipe(writer, output).then(function () {
            var result = output.toString();
            assert(result === "<document/>");
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

});
