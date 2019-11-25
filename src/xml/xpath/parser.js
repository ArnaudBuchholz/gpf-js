/**
 * @file XML XPath Parser
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
/*global _gpfXmlCheckQualifiedAttributeName*/ // Check XML qualified attribute name
/*global _gpfXmlCheckQualifiedElementName*/ // Check XML qualified element name
/*exported _GpfXmlParser*/ // gpf.xml.Parser
/*#endif*/

_gpfErrorDeclare("xml/xpath/parser", {
    /**
     * ### Summary
     *
     * Invalid XPath syntax
     *
     * ### Description
     *
     * This error is used when the parser can't process an XPath
     * @since 1.0.1
     */
    invalidXPathSyntax: "Invalid XPath syntax"
});

var _gpfXmlXPathParser = new RegExp("(\\/\\/|\\.\\/|\\/)(@)?(?:(\\w+):)?(\\w+|\\*)(?:\\[([^\\]]+)\\])*|\\s*(\\|)\\s*"),
    _GPF_XML_XPATH_LEVEL = 1,
    _GPF_XML_XPATH_ATTRIBUTE = 2,
    _GPF_XML_XPATH_NAMESPACE_PREFIX = 3,
    _GPF_XML_XPATH_NAME = 4,
    _GPF_XML_XPATH_FILTER = 5,
    _GPF_XML_XPATH_OR = 6;

function _gpfXmlXPathParseProcessMatch (match) {

}

/**
 * Parse the XPath expression
 *
 * @param {String} xpathExpression XPath expression to evaluate
 * @return {Object} Parsed expression
 * @since 1.0.1
 */
function _gpfXmlXPathParse (xpathExpression) {
    var stickyIndex = 0,
        match;
    _gpfXmlXPathParser.lastIndex = stickyIndex;
    match = _gpfXmlXPathParser.exec(xpathExpression);
    while (match) {
        _gpfXmlXPathParseProcessMatch(match)
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

    }
}
