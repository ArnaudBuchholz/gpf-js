/**
 * @file XML Writer
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
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
    invalidXmlWriterState: "Invalid XML Writer state",

    /**
     * ### Summary
     *
     * Invalid XML name
     *
     * ### Description
     *
     * Invalid XML Element and attribute name
     */
    invalidXmlName: "Invalid XML name",

    /**
     * ### Summary
     *
     * Invalid XML namespace prefix
     *
     * ### Description
     *
     * Invalid XML namespace prefix
     */
    invalidXmlNamespacePrefix: "Invalid XML namespace prefix",

    /**
     * ### Summary
     *
     * Unknown XML namespace prefix
     *
     * ### Description
     *
     * This error is triggered when an element or an attribute is prefixed with an unknown namespace prefix
     */
    unknownXmlNamespacePrefix: "Unknown XML namespace prefix"

});

var
    _gpfXmlWriterNameValidation = new RegExp("^[a-z_][a-zA-Z0-9_\\-]*$"),
    _gpfXmlWriterNamespacePrefixValidation = new RegExp("^(|[a-z_][a-zA-Z0-9_]*)$"),
    _gpfXmlWriterPredefinedNamespacePrefixes = ["xml", "xmlns"],

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
        },

        _elements: [],
        _nextNamespaces: {},
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

        _checkValidName: function (name) {
            if (!name.match(_gpfXmlWriterNameValidation)) {
                gpf.Error.invalidXmlName();
            }
        },

        _getNamespacePrefixURI: function (prefix) {
            return _gpfArrayForEachFalsy(this._elements, function (element) {
                return element.namespaces[prefix];
            });
        },

        _checkNamespacePrefixWasDefined: function (prefix) {
            if (!this._getNamespacePrefixURI(prefix)) {
                gpf.Error.unknownXmlNamespacePrefix();
            }
        },

        _checkNamespacePrefix: function (prefix) {
            if (prefix !== "xml") {
                this._checkNamespacePrefixWasDefined(prefix);
            }
        },

        _checkQualifiedName: function (qName) {
            var columnPos = qName.indexOf(":");
            if (-1 === columnPos) {
                this._checkValidName(qName);
            } else {
                this._checkNamespacePrefix(qName.substr(0, columnPos));
                this._checkValidName(qName.substr(columnPos + 1));
            }
        },

        _writeAttribute: function (qName, value) {
            this._appendToReadBuffer(" " + qName + "=\"");
            this._appendToReadBuffer(_gpfStringEscapeFor(value.toString(), "xml"));
            this._appendToReadBuffer("\"");
        },

        _validateAndwriteAttribute: function (value, qName) {
            this._checkQualifiedName(qName);
            this._writeAttribute(qName, value);
        },

        _processAttributes: function (attributes) {
            _gpfObjectForEach(attributes, this._validateAndwriteAttribute, this);
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

        _checkNotAPredefinedNamespacePrefix: function (prefix) {
            if (_gpfXmlWriterPredefinedNamespacePrefixes.indexOf(prefix) !== -1) {
                gpf.Error.invalidXmlNamespacePrefix();
            }
        },

        _checkValidNamespacePrefix: function (prefix) {
            if (!prefix.match(_gpfXmlWriterNamespacePrefixValidation)) {
                gpf.Error.invalidXmlNamespacePrefix();
            }
            this._checkNotAPredefinedNamespacePrefix(prefix);
        },

        // region gpf.interfaces.IXmlContentHandler

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
