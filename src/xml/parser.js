/**
 * @file XML Parser
 * @since 1.0.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_START*/ // 0
/*global _gpfArrayForEachAsync*/ // Almost like [].forEach (undefined are also enumerated) with async handling
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfIXmlContentHandler*/ // gpf.interfaces.IXmlContentHandler
/*global _gpfInterfaceQuery*/ // gpf.interfaces.query
/*global _gpfIsSynchronousInterface*/ // Check if synchronous interface
/*global _gpfStreamSecureWrite*/ // Generates a wrapper to secure multiple calls to stream#write
/*exported _GpfXmlParser*/ // gpf.xml.Parser
/*#endif*/

_gpfErrorDeclare("xml/parser", {
    /**
     * ### Summary
     *
     * Invalid XML syntax
     *
     * ### Description
     *
     * This error is used when the parser can't process an XML
     */
    invalidXmlSyntax: "Invalid XML syntax"
});

var
    _GPF_XML_PARSING_REGEXP = [
        "<\\?([^?]+)\\?>",
        "<((?:\\w+:)?[\\w\\-.]+)",
        "\\s*((?:\\w+:)?[\\w\\-.]+)=(?:\"|')([^\"']+)(?:\"|')",
        "(\\s*\\/>|<\\/(?:\\w+:)?[\\w\\-.]+>)",
        "<!--([^-]*)-->",
        "([^<>]+)",
        ">"
    ].join("|"),

    _GPF_XML_PARSER_PREFIX = 1,

    _GPF_XML_PARSER_PROCESSING_INSTRUCTION = 1,
    _GPF_XML_PARSER_OPEN_TAG = 2,
    _GPF_XML_PARSER_ATTRIBUTE_NAME = 3,
    _GPF_XML_PARSER_ATTRIBUTE_VALUE = 4,
    _GPF_XML_PARSER_CLOSE_TAG = 5,
    // _GPF_XML_PARSER_COMMENT = 6,
    _GPF_XML_PARSER_TEXT = 7,

    _GPF_XML_PARSER_HANDLERS;

function _gpfXmlParserNoop () {
    return Promise.resolve();
}

function _gpfXmlParserOpenNode (parser, node, chain) {
    node.notOpened = false;
    if (parser._synchronous) {
        parser._iXmlContentHandler.startElement(node.qName, node.attributes);
        return chain();
    }
    return parser._iXmlContentHandler.startElement(node.qName, node.attributes).then(chain);
}

function _gpfXmlParserCurrentNode (parser) {
    var numberOfNodes = parser._nodes.length;
    if (numberOfNodes) {
        return parser._nodes[--numberOfNodes];
    }
}

function _gpfXmlParserOpenCurrentNodeIfNeeded (parser, chain) {
    var node = _gpfXmlParserCurrentNode(parser);
    if (node && node.notOpened) {
        return _gpfXmlParserOpenNode(parser, node, chain);
    }
    return chain();
}

function _gpfXmlParserNextMatch (parser) {
    return parser._parser.exec(parser._buffer);
}

function _gpfXmlParserProcessMatch (parser, match) {
    var index = _GPF_XML_PARSER_PROCESSING_INSTRUCTION;
    while (index < _GPF_XML_PARSER_HANDLERS.length) {
        if (match[index]) {
            return _GPF_XML_PARSER_HANDLERS[index](parser, match);
        }
        ++index;
    }
    return Promise.resolve();
}

function _gpfXmlParserCheckFinalState (parser) {
    if (parser._nodes.length) {
        gpf.Error.invalidXmlSyntax();
    }
}

function _gpfXmlParserParseSync (parser) {
    parser._iXmlContentHandler.startDocument();
    var match = _gpfXmlParserNextMatch(parser);
    while (match) {
        _gpfXmlParserProcessMatch(parser, match);
        match = _gpfXmlParserNextMatch(parser);
    }
    _gpfXmlParserCheckFinalState(parser);
    parser._iXmlContentHandler.endDocument();
}

function _gpfXmlParserParseAsync (parser) {
    var match = _gpfXmlParserNextMatch(parser);
    if (match) {
        return _gpfXmlParserProcessMatch(parser, match).then(function () {
            return _gpfXmlParserParseAsync(parser);
        });
    }
    return Promise.resolve();
}

function _gpfXmlParserCreateDocumentAndParseAsync (parser) {
    return parser._iXmlContentHandler.startDocument()
        .then(function () {
            return _gpfXmlParserParseAsync(parser);
        })
        .then(function () {
            _gpfXmlParserCheckFinalState(parser);
            return parser._iXmlContentHandler.endDocument();
        });
}

function _gpfXmlParserProcessNamespaceAttribute (parser, namespacePrefix, uri) {
    var node = _gpfXmlParserCurrentNode(parser);
    var prefix = namespacePrefix.split(":")[_GPF_XML_PARSER_PREFIX] || "";
    node.namespacePrefixes.unshift(prefix);
    return parser._iXmlContentHandler.startPrefixMapping(prefix, uri);
}

function _gpfXmlParserEndPrefixMappings (parser, node, closeTag) {
    if (parser._synchronous) {
        parser._iXmlContentHandler.endElement();
        node.namespacePrefixes.forEach(function (prefix) {
            parser._iXmlContentHandler.endPrefixMapping(prefix);
        });
        _gpfXmlParserCheckNodeBeforeClosing(parser, node, closeTag);
        return Promise.resolve();
    }
    return parser._iXmlContentHandler.endElement()
        .then(function () {
            return _gpfArrayForEachAsync(node.namespacePrefixes, function (prefix) {
                _gpfXmlParserCheckNodeBeforeClosing(parser, node, closeTag);
                return parser._iXmlContentHandler.endPrefixMapping(prefix);
            });
        });
}

function _gpfXmlParserCheckNodeBeforeClosing (parser, node, closeTag) {
    var qName = closeTag.match(/(?:\w+:)?[\w\-.]+/);
    if (qName && node.qName !== qName.toString()) {
        gpf.Error.invalidXmlSyntax();
    }
}

_GPF_XML_PARSER_HANDLERS = [
    undefined,

    // _GPF_XML_PARSER_PROCESSING_INSTRUCTION
    function (parser, match) {
        var content = match[_GPF_XML_PARSER_PROCESSING_INSTRUCTION].trim(),
            separator = content.indexOf(" "),
            target = content.substring(_GPF_START, separator),
            data = content.substring(separator).trim();
        return parser._iXmlContentHandler.processingInstruction(target, data);
    },

    // _GPF_XML_PARSER_OPEN_TAG
    function (parser, match) {
        var qName = match[_GPF_XML_PARSER_OPEN_TAG],
            node = _gpfXmlParserCurrentNode(parser);
        parser._nodes.push({
            qName: qName,
            attributes: {},
            namespacePrefixes: [],
            notOpened: true
        });
        if (node && node.notOpened) {
            node.notOpened = false;
            return parser._iXmlContentHandler.startElement(node.qName, node.attributes);
        }
        return Promise.resolve();
    },

    // _GPF_XML_PARSER_ATTRIBUTE_NAME
    function (parser, match) {
        var node = _gpfXmlParserCurrentNode(parser),
            name = match[_GPF_XML_PARSER_ATTRIBUTE_NAME],
            value = match[_GPF_XML_PARSER_ATTRIBUTE_VALUE];
        if (name.startsWith("xmlns")) {
            return _gpfXmlParserProcessNamespaceAttribute(parser, name, value);
        }
        node.attributes[name] = value;
        return Promise.resolve();
    },

    // _GPF_XML_PARSER_ATTRIBUTE_VALUE
    _gpfXmlParserNoop,

    // _GPF_XML_PARSER_CLOSE_TAG
    function (parser, match) {
        return _gpfXmlParserOpenCurrentNodeIfNeeded(parser, function () {
            var node = parser._nodes.pop(),
                closeTag = match[_GPF_XML_PARSER_CLOSE_TAG];
            if (node.namespacePrefixes.length) {
                return _gpfXmlParserEndPrefixMappings(parser, node, closeTag);
            }
            _gpfXmlParserCheckNodeBeforeClosing(parser, node, closeTag);
            return parser._iXmlContentHandler.endElement();
        });
    },

    // _GPF_XML_PARSER_COMMENT
    function (parser/*, match*/) {
        return _gpfXmlParserOpenCurrentNodeIfNeeded(parser, _gpfXmlParserNoop);
        // function () {
        //     var text = match[_GPF_XML_PARSER_COMMENT].trim(); // ignore xml:space
        //     return parser._iXmlContentHandler.comment(text);
        // });
    },

    // _GPF_XML_PARSER_TEXT
    function (parser, match) {
        return _gpfXmlParserOpenCurrentNodeIfNeeded(parser, function () {
            var text = match[_GPF_XML_PARSER_TEXT].trim(); // ignore xml:space
            if (text.length) {
                return parser._iXmlContentHandler.characters(text);
            }
            return Promise.resolve();
        });
    }
];

var _GpfXmlParser = _gpfDefine({
    $class: "gpf.xml.Parser",

    /**
     * XML parser
     *
     * @constructor gpf.xml.Parser
     * @implements {gpf.interfaces.IWritableStream}
     * @implements {gpf.interfaces.IFlushableStream}
     * @implements {gpf.interfaces.ISynchronousable}
     * @param {gpf.interfaces.IXmlContentHandler} xmlContentHandler XML Content Handler that receives parsing events
     * @throws {gpf.Error.interfaceExpected}
     * @since 1.0.1
     */
    constructor: function (xmlContentHandler) {
        this._iXmlContentHandler = _gpfInterfaceQuery(_gpfIXmlContentHandler, xmlContentHandler);
        if (!this._iXmlContentHandler) {
            gpf.Error.interfaceExpected({
                name: "gpf.interfaces.IXmlContentHandler"
            });
        }
        this._synchronous = _gpfIsSynchronousInterface(this._iXmlContentHandler);
        this._buffer = [];
    },

    //region gpf.interfaces.IWritableStream

    /**
     * @gpf:sameas gpf.interfaces.IWritableStream#write
     * @since 0.1.9
     */
    write: _gpfStreamSecureWrite(function (buffer) {
        this._buffer.push(buffer.toString()); //eslint-disable-line no-invalid-this
        return Promise.resolve();
    }),

    //endregion

    //region gpf.interfaces.IFlushableStream

    /**
     * @gpf:sameas gpf.interfaces.IFlushableStream#flush
     * @since 0.2.3
     */
    flush: function () {
        this._parser = new RegExp(_GPF_XML_PARSING_REGEXP, "g");
        this._buffer = this._buffer.join("");
        this._nodes = [];
        if (this._synchronous) {
            _gpfXmlParserParseSync(this); // eslint-disable-line no-sync
            return Promise.resolve();
        }
        return _gpfXmlParserCreateDocumentAndParseAsync(this);
    },

    //endregion

    //region gpf.interfaces.ISynchronousable

    /**
     * @gpf:sameas gpf.interfaces.ISynchronousable#isSynchronous
     * @since 0.2.3
     */
    isSynchronous: function () {
        return this._synchronous;
    }

    //endregion
});
