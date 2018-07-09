/**
 * @file XML Writer
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global  _gpfStringEscapeFor*/ // Make the string content compatible with lang
/*global _gpfObjectForEach*/
/*global _gpfIgnore*/
/*global _GpfStreamBufferedRead*/ // gpf.stream.BufferedRead
/*exported _GpfXmlWriter*/ // gpf.xml.Writer
/*#endif*/

_gpfErrorDeclare("xml/writer", {

    /**
     * ### Summary
     *
     * Invalid XML Writer state
     *
     * ### Description
     *
     * This error is used when a method can not be called due to the current XML writer state
     */
    invalidXmlWriterState: "Invalid XML Writer state"

});

var
    _GpfXmlWriter = _gpfDefine({
        $class: "gpf.xml.Writer",
        $extend: _GpfStreamBufferedRead,

        /**
         * XML writer
         *
         * @constructor gpf.xml.Writer
         * @implements {gpf.interfaces.IReadableStream}
         * @implements {gpf.interfaces.IXmlContentHandler}
         * @extends gpf.stream.BufferedRead
         */
        constructor: function () {
            this._elements = [];
        },

        _elements: [],
        _started: false,

        _checkIfStarted: function (started) {
            if (this._started !== started) {
                gpf.Error.invalidXmlWriterState();
            }
        },

        _checkIfElementsExist: function (mustHaveElements) {
            if (mustHaveElements && this._elements.length === 0) {
                gpf.Error.invalidXmlWriterState();
            }
        },

        _checkState: function (started, mustHaveElements) {
            this._checkIfStarted(started);
            this._checkIfElementsExist(mustHaveElements);
        },

        // region gpf.interfaces.IXmlContentHandler

        _addContentToLastElement: function () {
            var element = this._elements[0];
            if (element && !element.content) {
                this._appendToReadBuffer(">");
                element.content = true;
            }
        },

        /** @gpf:sameas gpf.interfaces.IXmlContentHandler#characters */
        characters: function (buffer) {
            this._checkState(true, true);
            this._addContentToLastElement();
            this._appendToReadBuffer(_gpfStringEscapeFor(buffer.toString(), "xml"));
            return Promise.resolve();
        },

        /** @gpf:sameas gpf.interfaces.IXmlContentHandler#endDocument */
        endDocument: function () {
            this._checkState(true, false);
            this._completeReadBuffer();
            return Promise.resolve();
        },

        /** @gpf:sameas gpf.interfaces.IXmlContentHandler#endElement */
        endElement: function () {
            this._checkState(true, true);
            var element = this._elements.shift();
            if (element.content) {
                this._appendToReadBuffer("</" + element.qName + ">");
            } else {
                this._appendToReadBuffer("/>");
            }
            return Promise.resolve();
        },

        /** @gpf:sameas gpf.interfaces.IXmlContentHandler#endPrefixMapping */
        endPrefixMapping: function (prefix) {
            this._checkState(true, false);
            _gpfIgnore(prefix);
            return Promise.resolve();
        },

        /** @gpf:sameas gpf.interfaces.IXmlContentHandler#processingInstruction */
        processingInstruction: function (target, data) {
            this._checkState(true, false);
            this._appendToReadBuffer("<?" + target + " " + data + "?>\n");
            return Promise.resolve();
        },

        /** @gpf:sameas gpf.interfaces.IXmlContentHandler#startDocument */
        startDocument: function () {
            this._checkState(false, false);
            this._started = true;
            return Promise.resolve();
        },

        _processAttributes: function (attributes) {
            _gpfObjectForEach(attributes, function (value, name) {
                this._appendToReadBuffer(" " + name + "=\"");
                this._appendToReadBuffer(_gpfStringEscapeFor(value.toString(), "xml"));
                this._appendToReadBuffer("\"");
            }, this);
        },

        /** @gpf:sameas gpf.interfaces.IXmlContentHandler#startElement */
        startElement: function (qName, attributes) {
            this._checkState(true, false);
            this._addContentToLastElement();
            this._appendToReadBuffer("<" + qName);
            if (attributes) {
                this._processAttributes(attributes);
            }
            this._elements.unshift({
                qName: qName
            });
        },

        /** @gpf:sameas gpf.interfaces.IXmlContentHandler#startPrefixMapping */
        startPrefixMapping: function (prefix, uri) {
            this._checkState(true, false);
            _gpfIgnore(prefix);
            _gpfIgnore(uri);
        }

        //endregion

    });
