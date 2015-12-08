"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

/*eslint-disable max-nested-callbacks*/

describe("i_xml", function () {

    describe("IXmlSerializable", function () {
        it("is a known and static interface", function () {
            /* jshint unused:false */
            assert(gpf.interfaces.isImplementedBy({
                toXml: function (out, eventsHandler) {}
            }, gpf.interfaces.IXmlSerializable));
            /* jshint unused:true */
        });
    });

    describe("IXmlContentHandler", function () {
        it("is a known and static interface", function () {
            /* jshint unused:false */
            assert(gpf.interfaces.isImplementedBy({
                characters: function (buffer, eventsHandler) {},
                endDocument: function (eventsHandler) {},
                endElement: function (eventsHandler) {},
                endPrefixMapping: function (prefix) {},
                ignorableWhitespace: function (buffer, eventsHandler) {},
                processingInstruction: function (target, data, eventsHandler) {
                },
                setDocumentLocator: function (locator) {},
                skippedEntity: function (name) {},
                startDocument: function (eventsHandler) {},
                startElement: function (uri, localName, qName, attributes,
                                        eventsHandler) {},
                startPrefixMapping: function (prefix, uri) {}
            }, gpf.interfaces.IXmlContentHandler));
            /* jshint unused:true */
        });
    });

});
