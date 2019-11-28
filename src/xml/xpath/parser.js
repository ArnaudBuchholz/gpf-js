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
    "\\.		CURRENT",
    "@			ATTRIBUTE",
    "\\*		ANY",
    "\\w+:		NAMESPACE_PREFIX",
    "\\w+		NAME"
]));

// <start> -> <level> (CONCAT <level>)?
// <level> -> CURRENT? (SUB|DEPTH) <match>
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

    function consumeIfTokenMatch () {
        var expected = _gpfArraySlice(arguments),
            current = tokens[0];
        if (expected.include(current)) {
            tokens.shift();
            return current;
        }
    }

    function checkAndConsumeIfTokenMatch () {
        var token = consumeIfTokenMatch.apply(this, arguments);
        if (!token) {
            gpf.Error.invalidXPathSyntax();
        }
    }

    function match () {
        var
    }

    var levelClasses = {};
    levelClasses[_GPF_XML_XPATH_TOKEN.SUB] = _gpfXmlXPathSub;
    levelClasses[_GPF_XML_XPATH_TOKEN.DEEP] = _gpfXmlXPathDeep;

    function level () {
        var current = consumeIfTokenMatch(false, _GPF_XML_XPATH_TOKEN.CURRENT),
            level = checkAndConsumeIfTokenMatch(_GPF_XML_XPATH_TOKEN.SUB, _GPF_XML_XPATH_TOKEN.DEEP),
            Operator = levelClasses[level];
        var operator = new Operator();
        operator.addChild(match());
        return operator;
    }

    function start () {
        var concat = new _gpfXmlXPathConcat();
        concat.addChild(level());
        while (consumeIfTokenMatch(_GPF_XML_XPATH_TOKEN.CONCAT)) {
            concat.addChild(operator());
        }
    }

    return start();
}
