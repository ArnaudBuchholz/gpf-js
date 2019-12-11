/**
 * @file XML XPath Parser
 * @since 1.0.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_START*/ // 0
/*global _GpfXmlXPathChain*/ // gpf.xml.xpath.Chain
/*global _GpfXmlXPathConcat*/ // gpf.xml.xpath.Concat
/*global _GpfXmlXPathDeep*/ // gpf.xml.xpath.Deep
/*global _GpfXmlXPathMatch*/ // gpf.xml.xpath.Match
/*global _GpfXmlXPathSub*/ // gpf.xml.xpath.Sub
/*global _gpfArraySlice*/ // [].slice.call
/*global _gpfArrayTail*/ // [].slice.call(,1)
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfRegExpTokenize*/ // _gpfRegExpForEach with token #
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
        if (token.name) {
            _GPF_XML_XPATH_TOKEN[token.name] = ++index;
        }
        regexpSource.push(token.regexp);
    });
    _GPF_XML_XPATH_TOKEN.regexp = new RegExp(regexpSource.join("|"), "g");
}([
    {regexp: "\\s+"},
    {regexp: "(\\|)", name: "CONCAT"},
    {regexp: "(\\/\\/)", name: "DEEP"},
    {regexp: "(\\/)", name: "SUB"},
    {regexp: "(\\.)", name: "CURRENT"},
    {regexp: "(@)", name: "ATTRIBUTE"},
    {regexp: "(\\*)", name: "ANY"},
    {regexp: "(\\w+):", name: "NAMESPACE_PREFIX"},
    {regexp: "(\\w+)", name: "NAME"}
]));

// <start> -> <level> (CONCAT <level>)?
// <level> -> (CURRENT? (SUB|DEEP))? <match> ( (SUB|DEEP) <match> )*
// <match> -> ATTRIBUTE? NAMESPACE_PREFIX? (NAME|ANY)

/**
 * Parse the XPath expression
 *
 * @param {String} xpathExpression XPath expression to evaluate
 * @return {Object} Parsed expression
 * @since 1.0.1
 */
function _gpfXmlXPathParse (xpathExpression) {
    var tokens = _gpfRegExpTokenize(_GPF_XML_XPATH_TOKEN.regexp, xpathExpression, true);

    function consumeIfTokenMatch () {
        var expected = _gpfArraySlice(arguments),
            current = tokens[_GPF_START];

        function consumeIfExpected () {
            if (expected.includes(current.token)) {
                tokens.shift();
                return current;
            }
        }

        if (current) {
            return consumeIfExpected();
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

        function getName () {
            if (any) {
                return "";
            }
            return checkAndConsumeIfTokenMatch(_GPF_XML_XPATH_TOKEN.NAME)[_GPF_XML_XPATH_TOKEN.NAME];
        }
        name = getName();

        function getNamespacePrefix () {
            if (namespacePrefix) {
                return namespacePrefix[_GPF_XML_XPATH_TOKEN.NAMESPACE_PREFIX];
            }
            return "";
        }
        namespacePrefix = getNamespacePrefix();

        return new _GpfXmlXPathMatch(Boolean(isAttribute), namespacePrefix, name);
    }

    var levelClasses = {};
    levelClasses[_GPF_XML_XPATH_TOKEN.SUB] = _GpfXmlXPathSub;
    levelClasses[_GPF_XML_XPATH_TOKEN.DEEP] = _GpfXmlXPathDeep;

    function operatorOrFirstChild (operator) {
        var children = operator.getChildren();
        if (!_gpfArrayTail(children).length) {
            return children[_GPF_START];
        }
        return operator;
    }

    function level () {
        var relative,
            chain = new _GpfXmlXPathChain(),
            subOrDeep,
            operator;

        function firstLevelNoSubOrDeep () {
            if (relative) {
                gpf.Error.invalidXPathSyntax();
            }
            relative = true;
            subOrDeep = {
                token: _GPF_XML_XPATH_TOKEN.SUB
            };
        }

        function firstLevel () {
            relative = Boolean(consumeIfTokenMatch(_GPF_XML_XPATH_TOKEN.CURRENT));
            subOrDeep = consumeIfTokenMatch(_GPF_XML_XPATH_TOKEN.SUB, _GPF_XML_XPATH_TOKEN.DEEP);
            if (!subOrDeep) {
                firstLevelNoSubOrDeep();
            }
        }

        firstLevel();
        while (subOrDeep) {
            operator = new levelClasses[subOrDeep.token](relative);
            operator.addChild(match());
            chain.addChild(operator);
            relative = true;
            subOrDeep = consumeIfTokenMatch(_GPF_XML_XPATH_TOKEN.SUB, _GPF_XML_XPATH_TOKEN.DEEP);
        }
        return operatorOrFirstChild(chain);
    }

    function start () {
        var concat = new _GpfXmlXPathConcat();
        concat.addChild(level());
        while (consumeIfTokenMatch(_GPF_XML_XPATH_TOKEN.CONCAT)) {
            concat.addChild(level());
        }
        return operatorOrFirstChild(concat);
    }

    return start();
}

/**
 * @gpf:sameas _gpfXmlXPathParse
 * @since 1.0.1
 */
gpf.xml.xpath.parse = _gpfXmlXPathParse;
