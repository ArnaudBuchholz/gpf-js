/**
 * @file XML Writer
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfEmptyFunc*/
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global  _gpfStringEscapeFor*/ // Make the string content compatible with lang
/*global _gpfObjectForEach*/
/*global _gpfArrayForEachFalsy*/
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
            this._nextNamespaces = {};
            this._checkIfStarted = gpf.Error.invalidXmlWriterState;
        },

        _elements: [],
        _nextNamespaces: {},

        _checkIfElementsExist: function (hasElements) {
            if (hasElements !== (this._elements.length !== 0)) {
                gpf.Error.invalidXmlWriterState();
            }
        },

        _checkState: function (hasElements) {
            this._checkIfStarted();
            if (undefined !== hasElements) {
                this._checkIfElementsExist(hasElements);
            }
        },

        _addContentToElement: function (element) {
            if (!element.content) {
                this._appendToReadBuffer(">");
                element.content = true;
            }
        },

        _addContentToLastElement: function () {
            var element = this._elements[0];
            if (element) {
                return this._addContentToElement(element);
            }
        },

        _writeAttribute: function (qName, value) {
            this._appendToReadBuffer(" " + qName + "=\"");
            this._appendToReadBuffer(_gpfStringEscapeFor(value.toString(), "xml"));
            this._appendToReadBuffer("\"");
        },

        _getNamespacePrefixes: function () {

            return _gpfArrayForEachFalsy(this._elements, function (element) {
                return element.namespaces[prefix];
            });
        },

        _processAttributes: function (attributes) {
            _gpfObjectForEach(attributes,function (value, qName){
                /*jshint validthis:true*/
                var me = this; //eslint-disable-line no-invalid-this
                _gpfXmlCheckQualifiedAttributeName(qName, me._getNamespacePrefixes());
                me._writeAttribute(qName, value);
            }, this);
        },

        _processNamespaces: function (namespaces) {
            _gpfObjectForEach(namespaces, function (value, name) {
                /*jshint validthis:true*/
                var me = this; //eslint-disable-line no-invalid-this
                if (name) {
                    me._writeAttribute("xmlns:" + name, value);
                } else {
                    me._writeAttribute("xmlns", value);
                }
            }, this);
        },

        // region gpf.interfaces.IXmlContentHandler

        /** @gpf:sameas gpf.interfaces.IXmlContentHandler#characters */
        characters: function (buffer) {
            this._checkState(true);
            this._addContentToLastElement();
            this._appendToReadBuffer(_gpfStringEscapeFor(buffer.toString(), "xml"));
            return Promise.resolve();
        },

        /** @gpf:sameas gpf.interfaces.IXmlContentHandler#endDocument */
        endDocument: function () {
            this._checkState(false);
            this._checkIfStarted = gpf.Error.invalidXmlWriterState;
            this._completeReadBuffer();
            return Promise.resolve();
        },

        /** @gpf:sameas gpf.interfaces.IXmlContentHandler#endElement */
        endElement: function () {
            this._checkState(true);
            var element = this._elements.shift();
            if (element.content) {
                this._appendToReadBuffer("</" + element.qName + ">");
            } else {
                this._appendToReadBuffer("/>");
            }
            return Promise.resolve();
        },

        /**
         * @gpf:sameas gpf.interfaces.IXmlContentHandler#endPrefixMapping
         * Actually this call is ignored since closing the element owning the namespaces will do the same.
         */
        endPrefixMapping: function (prefix) {
            this._checkState(true);
            _gpfIgnore(prefix);
            return Promise.resolve();
        },

        /** @gpf:sameas gpf.interfaces.IXmlContentHandler#processingInstruction */
        processingInstruction: function (target, data) {
            this._checkState(false);
            this._appendToReadBuffer("<?" + target + " " + data + "?>\n");
            return Promise.resolve();
        },

        /** @gpf:sameas gpf.interfaces.IXmlContentHandler#startDocument */
        startDocument: function () {
            this._checkIfStarted = _gpfEmptyFunc;
            this.startDocument = gpf.Error.invalidXmlWriterState;
            this._checkState(false);
            this._started = true;
            return Promise.resolve();
        },

        /** @gpf:sameas gpf.interfaces.IXmlContentHandler#startElement */
        startElement: function (qName, attributes) {
            var namespaces = this._nextNamespaces;
            this._checkState(true);
            this._addContentToLastElement();
            this._elements.unshift({
                qName: qName,
                namespaces: namespaces
            });
            this._nextNamespaces = {};
            this._checkQualifiedName(qName);
            this._appendToReadBuffer("<" + qName);
            if (attributes) {
                this._processAttributes(attributes);
            }
            this._processNamespaces(namespaces);
        },

        /** @gpf:sameas gpf.interfaces.IXmlContentHandler#startPrefixMapping */
        startPrefixMapping: function (prefix, uri) {
            this._checkState(true);
            this._checkValidNamespacePrefix(prefix);
            if (this._nextNamespaces[prefix]) {
                gpf.Error.invalidXmlWriterState();
            }
            this._nextNamespaces[prefix] = uri;
        }

        //endregion

    });
