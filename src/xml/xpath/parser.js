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
/*global _gpfRegExpTokenize*/ // _gpfRegExpForEach with token #
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

var _GPF_XML_XPATH_TOKEN = {};

(function (tokens) {
    var index = _GPF_START,
        regexpSource = [];
    tokens.forEach(function (token) {
        if (token.includes("\t")) {
            var split = token.split("\t"),
                tokenName = split.pop();
            _GPF_XML_XPATH_TOKEN[tokenName] = ++index;
            regexpSource.push("(" + split[0] + ")");
        } else {
            regexpSource.push(token);
        }
    });
    _GPF_XML_XPATH_TOKEN.regexp = new RegExp(regexpSource.join("|"), "g");
}([
    "\\s+",
    "\\|		CONCAT",
    "\\/\\/		DEPTH",
    "\\/		SUB",
    "\\.		ROOT",
    "@			ATTRIBUTE",
    "\\*		ANY",
    "\\w+:		NAMESPACE_PREFIX",
    "\\w+		NAME"
]));

// <start> -> ROOT? (SUB|DEPTH) <match> (CONCAT <start>)?
// <match> -> ATTRIBUTE? NAMESPACE_PREFIX? (NAME|ANY) ((SUB|DEPTH) <match>)?

/**
 * Parse the XPath expression
 *
 * @param {String} xpathExpression XPath expression to evaluate
 * @return {Object} Parsed expression
 * @since 1.0.1
 */
function _gpfXmlXPathParse (xpathExpression) {
    var tokens = _gpfRegExpTokenize(_GPF_XML_XPATH_TOKEN.regexp, xpathExpression);
}
