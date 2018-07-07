/**
 * @file XML Writer
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
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

        _checkIfElementsExist: function (hasElements) {
            if (hasElements !== (this._elements.length !== 0)) {
                gpf.Error.invalidXmlWriterState();
            }
        },

        _checkState: function (started, hasElements) {
            this._checkIfStarted(started);
            this._checkIfElementsExist(hasElements);
        },

        // region gpf.interfaces.IXmlContentHandler

        /** @gpf:sameas gpf.interfaces.IXmlContentHandler#characters */
        characters: function (buffer) {
            this._checkState(true, true);
            this._appendToReadBuffer(buffer);
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
            var qName = this._elements.shift();
            this._appendToReadBuffer("</" + qName + ">");
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
            this._appendToReadBuffer("<?" + target + " " + data + ">");
            return Promise.resolve();
        },

        /** @gpf:sameas gpf.interfaces.IXmlContentHandler#startDocument */
        startDocument: function () {
            this._checkState(false, false);
            this._started = true;
            return Promise.resolve();
        },

        /** @gpf:sameas gpf.interfaces.IXmlContentHandler#startElement */
        startElement: function (qName, attributes) {
            this._checkState(true, false);

        },

        /** @gpf:sameas gpf.interfaces.IXmlContentHandler#startPrefixMapping */
        startPrefixMapping: function (prefix, uri) {
            this._checkState(true, false);
            _gpfIgnore(prefix);
            _gpfIgnore(uri);
        }

        //endregion

    });
