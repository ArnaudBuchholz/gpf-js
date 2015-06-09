/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefIntrf*/ // gpf.define for interfaces
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*#endif*/

/**
 * Defines the possibility for the object to be saved as XML
 *
 * @class gpf.interfaces.IXmlSerializable
 * @extends gpf.interfaces.Interface
 */
_gpfDefIntrf("IXmlSerializable", {

    /**
     * Translate obj into an gpf.interfaces.IXmlContentHandler and serialize
     * itself into XML
     *
     * @param {gpf.interfaces.IXmlContentHandler} out XML Content handler
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event ready
     */
    "[toXml]": [gpf.$ClassEventHandler()],
    toXml: function (out, eventsHandler) {
        _gpfIgnore(out);
        _gpfIgnore(eventsHandler);
    }

});

/**
 * Defines the possibility for an object to receive XML serialization events
 *
 * @class gpf.interfaces.IXmlContentHandler
 * @extends gpf.interfaces.Interface
 *
 * Inspired from
 * http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
 */
_gpfDefIntrf("IXmlContentHandler", {

    /**
     * Receive notification of character data
     *
     * @param {String} buffer characters
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event ready
     */
    "[characters]": [gpf.$ClassEventHandler()],
    characters: function (buffer, eventsHandler) {
        _gpfIgnore(buffer);
        _gpfIgnore(eventsHandler);
    },

    /**
     * Receive notification of the end of a document
     *
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event ready
     */
    "[endDocument]": [gpf.$ClassEventHandler()],
    endDocument: function (eventsHandler) {
        _gpfIgnore(eventsHandler);
    },

    /**
     * Signal the end of an element
     *
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event ready
     */
    "[endElement]": [gpf.$ClassEventHandler()],
    endElement: function (eventsHandler) {
        _gpfIgnore(eventsHandler);
    },

    /**
     *  End the scope of a prefix-URI mapping
     *
     * @param {String} prefix
     *
     * @event ready
     */
    endPrefixMapping: function (prefix) {
        _gpfIgnore(prefix);
    },

    /**
     * Receive notification of ignorable whitespace in element content
     *
     * @param {String} buffer characters
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event ready
     */
    "[ignorableWhitespace]": [gpf.$ClassEventHandler()],
    ignorableWhitespace: function (buffer, eventsHandler) {
        _gpfIgnore(buffer);
        _gpfIgnore(eventsHandler);
    },

    /**
     * Receive notification of a processing instruction
     *
     * @param {String} target
     * @param {String} data
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event ready
     */
    "[processingInstruction]": [gpf.$ClassEventHandler()],
    processingInstruction: function (target, data, eventsHandler) {
        _gpfIgnore(target);
        _gpfIgnore(data);
        _gpfIgnore(eventsHandler);
    },

    /**
     * Receive an object for locating the origin of SAX document events.
     *
     * @param {*} locator
     */
    setDocumentLocator: function (locator) {
        _gpfIgnore(locator);
    },

    /**
     * Receive notification of a skipped entity
     *
     * @param {String} name
     */
    skippedEntity: function (name) {
        _gpfIgnore(name);
    },

    /**
     * Receive notification of the beginning of a document
     *
     * @param {gpf.events.Handler} eventsHandler
     */
    "[startDocument]": [gpf.$ClassEventHandler()],
    startDocument: function (eventsHandler) {
        _gpfIgnore(eventsHandler);
    },

    /**
     * Receive notification of the beginning of an element
     *
     * @param {String} uri [uri=""] namespace uri (if any)
     * @param {String} localName
     * @param {String} [qName=localName] qName qualified name
     * @param {Object} attributes attribute dictionary (string/string)
     * @param {gpf.events.Handler} eventsHandler
     */
    "[startElement]": [gpf.$ClassEventHandler()],
    startElement: function (uri, localName, qName, attributes,
                            eventsHandler) {
        _gpfIgnore(uri);
        _gpfIgnore(localName);
        _gpfIgnore(qName);
        _gpfIgnore(attributes);
        _gpfIgnore(eventsHandler);
    },

    /**
     * Begin the scope of a prefix-URI Namespace mapping
     *
     * @param {String} prefix
     * @param {String} uri
     */
    startPrefixMapping: function (prefix, uri) {
        _gpfIgnore(prefix);
        _gpfIgnore(uri);
    }

});

