/*#ifndef(UMD)*/
"use strict";
/*global _gpfAlpha*/ // Letters (lowercase)
/*global _gpfALPHA*/ // Letters (uppercase)
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfExtend*/ // gpf.extend
/*global _gpfI*/ // gpf.interfaces
/*exported _gpfIsValidXmlName*/
/*#endif*/

_gpfErrorDeclare("xml", {
    "XmlInvalidName":
        "Invalid XML name"
});

var
    // Namespaces shortcut
    gpfFireEvent = gpf.events.fire

/*
    // XML Parser constants
    _XMLPARSER_STATE_NONE = 0
*/
    ;

gpf.xml = {};

//region XML Writer

/**
 * A class to serialize an XML into a string
 *
 * @class gpf.xml.Writer
 * @implements gpf.interfaces.IXmlContentHandler
 */
_gpfDefine("gpf.xml.Writer", {

    "[Class]": [gpf.$InterfaceImplement(_gpfI.IXmlContentHandler)],

    private: {

        /**
         * @type {gpf.interfaces.IWritableStream}
         * @private
         */
        _stream: null,

        /**
         * @type {Boolean[]}
         * @private
         */
        _branch: [],

        /**
         * @type {String[]}
         * @private
         */
        _pendingPrefixMappings: [],

        /**
         * @type {String[]}
         * @private
         */
        _buffer: [],

        /**
         * @type {gpf.events.Handler}
         * @private
         */
        _eventsHandler: null,

        /**
         * Close the current tag (if opened) in order to put content in it
         *
         * @private
         */
        _closeLeafForContent: function() {
            var leaf;
            if (this._branch.length) {
                leaf = this._branch[this._branch.length - 1];
                if (!leaf.hasContent) {
                    this._buffer.push(">");
                    leaf.hasContent = true;
                }
            }
        },

        /**
         * Flush the buffer into the stream
         *
         * @param {gpf.events.Handler} eventsHandler
         * @private
         */
        _flush: function (eventsHandler) {
            this._eventsHandler = eventsHandler;
            this._flushed();
        },

        /**
         * Handle write event on stream
         *
         * @param {gpf.events.Event} event
         * @private
         */
        _flushed: function (event) {
            var
                eventsHandler;
            if (event
                && event.type() === _gpfI.IWritableStream.EVENT_ERROR) {
                gpfFireEvent.apply(this, [
                    event,
                    this._eventsHandler
                ]);
            } else if (0 === this._buffer.length) {
                eventsHandler = this._eventsHandler;
                this._eventsHandler = null;
                gpfFireEvent.apply(this, [
                    _gpfI.IWritableStream.EVENT_READY,
                    eventsHandler
                ]);
            } else {
                this._stream.write(this._buffer.shift(),
                    gpf.Callback.bind(this, "_flushed"));
            }
        }

    },

    public: {

        /**
         * @param {gpf.interfaces.IWritableStream} stream
         * @constructor
         */
        constructor: function(stream) {
            this._stream = _gpfI.query(stream, _gpfI.IWritableStream, true);
            this._branch = [];
            this._pendingPrefixMappings = [];
            this._buffer = [];
        },

        //region gpf.interfaces.IXmlContentHandler

        /**
         * @implements gpf.interfaces.IXmlContentHandler:characters
         */
        characters: function (buffer, eventsHandler) {
            gpf.ASSERT(null === this._eventsHandler, "Write in progress");
            this._closeLeafForContent();
            this._buffer.push(buffer);
            this._flush(eventsHandler);
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:endDocument
         */
        endDocument: function (eventsHandler) {
            gpf.ASSERT(null === this._eventsHandler, "Write in progress");
            // Nothing to do
            this._flush(eventsHandler);
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:endElement
         */
        endElement: function (eventsHandler) {
            gpf.ASSERT(null === this._eventsHandler, "Write in progress");
            var
                leaf = this._branch.pop();
            if (leaf.hasContent) {
                this._buffer.push("</", leaf.qName, ">");
            } else {
                this._buffer.push("/>");
            }
            this._flush(eventsHandler);
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:endPrefixMapping
         */
        endPrefixMapping: function (prefix) {
            // Nothing to do (?)
            gpf.interfaces.ignoreParameter(prefix);
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:ignorableWhitespace
         */
        ignorableWhitespace: function (buffer, eventsHandler) {
            gpf.ASSERT(null === this._eventsHandler, "Write in progress");
            this._closeLeafForContent();
            this._buffer.push(buffer);
            this._flush(eventsHandler);
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:
         * processingInstruction
         */
        processingInstruction: function (target, data, eventsHandler) {
            gpf.ASSERT(null === this._eventsHandler, "Write in progress");
            this._buffer.push("<?", target, " ", gpf.escapeFor(data, "xml"),
                "?>");
            this._flush(eventsHandler);
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:setDocumentLocator
         */
        setDocumentLocator: function (locator) {
            // Nothing to do
            gpf.interfaces.ignoreParameter(locator);
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:skippedEntity
         */
        skippedEntity: function (name) {
            // Nothing to do
            gpf.interfaces.ignoreParameter(name);
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:startDocument
         */
        startDocument: function (eventsHandler) {
            gpf.ASSERT(null === this._eventsHandler, "Write in progress");
            // Nothing to do
            this._flush(eventsHandler);
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:startElement
         */
        startElement: function (uri, localName, qName, attributes,
            eventsHandler) {
            gpf.ASSERT(null === this._eventsHandler, "Write in progress");
            var
                attName,
                attValue,
                len,
                idx;
            if (undefined === qName && !uri) {
                qName = localName;
            }
            this._closeLeafForContent();
            var leaf = {
                hasContent: false,
                qName: qName
            };
            this._branch.push(leaf);
            this._buffer.push("<", qName);
            if (attributes) {
                for (attName in attributes) {
                    if (attributes.hasOwnProperty(attName)) {
                        this._buffer.push(" ", attName, "=\"");
                        attValue = gpf.escapeFor(
                            attributes[attName].toString(), "xml");
                        if (-1 < attValue.indexOf("\"")) {
                            attValue = gpf.replaceEx(attValue, {
                                "\"": "&quot;"
                            });
                        }
                        this._buffer.push(attValue, "\"");
                    }
                }
            }
            len = this._pendingPrefixMappings.length;
            if (len) {
                for (idx = 0; idx < len; ++idx) {
                    this._buffer.push(" ",
                        this._pendingPrefixMappings[idx]);
                }
                this._pendingPrefixMappings = [];
            }
            this._flush(eventsHandler);
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:startPrefixMapping
         */
        startPrefixMapping: function (prefix, uri) {
            this._pendingPrefixMappings.push(["xmlns:", prefix, ":\"",
                gpf.escapeFor(uri, "xml"), "\""].join(""));
        }

        //endregion

    }

});

//endregion

//region Parsing

/**
 * Tries to convert any value into XML
 *
 * @param {*} value
 * @param {Object} out Recipient object for XML serialization
 * @param {gpf.events.Handler} eventsHandler
 *
 * @event ready
 */
gpf.xml.convert = function (value, out, eventsHandler) {
    var
        iXmlSerializable;
    if ("string" === typeof value) {
        throw gpf.Error.NotImplemented();
    } else if ("object" === typeof value) {
        iXmlSerializable = _gpfI.query(value, _gpfI.IXmlSerializable);
        if (null === iXmlSerializable) {
            iXmlSerializable = new gpf.xml.ConstNode(value);
        }
        iXmlSerializable.toXml(out, eventsHandler);
    }
};

//endregion

//region Helpers

var
    _firstValidChar = _gpfAlpha + _gpfALPHA + "_",
    _otherValidChars = _firstValidChar + "012345789.-",

    /**
     * @inheritdoc gpf.xml#isValidName
     * Implementation of gpf.xml.isValidName
     * @private
     */
    _gpfIsValidXmlName = function (name) {
        var
            idx;
        if (0 === name.length
            || -1 === _firstValidChar.indexOf(name.charAt(0))) {
            return false;
        }
        for (idx = 1; idx < name.length; ++idx) {
            if (-1 === _otherValidChars.indexOf(name.charAt(idx))) {
                return false;
            }
        }
        return true;
    };

_gpfExtend(gpf.xml, {

    /**
     * Check that the provided name can be use as an element or attribute
     * name
     *
     * @param {String} name
     * @return {Boolean}
     */
    isValidName: _gpfIsValidXmlName,

    /**
     * Make sure that the provided name can be use as an element or
     * attribute name
     *
     * @param {String} name
     * @return {String} a valid attribute/element name
     */
    toValidName: function (name) {
        var newName;
        if (gpf.xml.isValidName(name)) {
            return name;
        }
        // Try with a starting _
        newName = "_" + name;
        if (!gpf.xml.isValidName(newName)) {
            throw gpf.Error.XmlInvalidName();
        }
        return newName;
    }

});

//endregion