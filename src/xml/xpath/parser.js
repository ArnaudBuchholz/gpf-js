/**
 * @file XML XPath Parser
 * @since 1.0.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_START*/ // 0
/*global _gpfArraySlice*/
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfRegExpTokenize*/ // _gpfRegExpForEach with token #
/*global _GpfXmlXPathConcat*/
/*global _GpfXmlXPathDeep*/
/*global _GpfXmlXPathMatch*/
/*global _GpfXmlXPathSub*/
/*exported _gpfXmlXPathParse*/ // gpf.xml.Parser
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
    "\\/\\/		DEEP",
    "\\/		SUB",
    "\\.		CURRENT",
    "@			ATTRIBUTE",
    "\\*		ANY",
    "\\w+:		NAMESPACE_PREFIX",
    "\\w+		NAME"
]));

// <start> -> <level> (CONCAT <level>)?
// <level> -> CURRENT? (SUB|DEEP) <match>
// <match> -> ATTRIBUTE? NAMESPACE_PREFIX? (NAME|ANY)

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
            current = tokens[_GPF_START];
        if (current && expected.includes(current.token)) {
            tokens.shift();
            return current;
        }
    }

    function checkAndConsumeIfTokenMatch () {
        var token = consumeIfTokenMatch.apply(null, arguments);
        if (!token) {
            gpf.Error.invalidXPathSyntax();
        }
        return token;
    }

    function match () {
        var isAttribute = consumeIfTokenMatch(_GPF_XML_XPATH_TOKEN.ATTRIBUTE),
            namespacePrefix = consumeIfTokenMatch(_GPF_XML_XPATH_TOKEN.NAMESPACE_PREFIX),
            any = consumeIfTokenMatch(_GPF_XML_XPATH_TOKEN.ANY),
            name;
        if (!any) {
            name = checkAndConsumeIfTokenMatch(_GPF_XML_XPATH_TOKEN.NAME)[_GPF_XML_XPATH_TOKEN.NAME];
        } else {
            name = "";
        }
        if (namespacePrefix) {
            namespacePrefix = namespacePrefix[_GPF_XML_XPATH_TOKEN.NAMESPACE_PREFIX];
            namespacePrefix = namespacePrefix.substring(0, namespacePrefix.length - 1);
        } else {
            namespacePrefix = "";
        }
        return new _GpfXmlXPathMatch(Boolean(isAttribute), namespacePrefix, name);
    }

    var levelClasses = {};
    levelClasses[_GPF_XML_XPATH_TOKEN.SUB] = _GpfXmlXPathSub;
    levelClasses[_GPF_XML_XPATH_TOKEN.DEEP] = _GpfXmlXPathDeep;

    function level () {
        var relative = Boolean(consumeIfTokenMatch(_GPF_XML_XPATH_TOKEN.CURRENT)),
            level = checkAndConsumeIfTokenMatch(_GPF_XML_XPATH_TOKEN.SUB, _GPF_XML_XPATH_TOKEN.DEEP),
            Operator = levelClasses[level.token];
        var operator = new Operator(relative);
        operator.addChild(match());
        return operator;
    }

    function concatOrOperator (concat) {
        var children = concat.getChildren();
        if (children.length === 1) {
            return children[0];
        }
        return concat;
    }

    function start () {
        var concat = new _GpfXmlXPathConcat();
        concat.addChild(level());
        while (consumeIfTokenMatch(_GPF_XML_XPATH_TOKEN.CONCAT)) {
            concat.addChild(level());
        }
        return concatOrOperator(concat);
    }

    return start();
}

/** @gpf:sameas _gpfXmlXPathParse */
gpf.xml.xpath.parse = _gpfXmlXPathParse;
