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
    {regexp: "(\\[)", name: "CONDITION_OPEN"},
    {regexp: "(\\])", name: "CONDITION_CLOSE"},
    {regexp: "(\\*)", name: "ANY"},
    {regexp: "(\\w+):", name: "NAMESPACE_PREFIX"},
    {regexp: "(\\w+)", name: "NAME"},
    {regexp: "(.)", name: "ERROR"}
]));

var _gpfXmlXPathLevelClasses = {};
_gpfXmlXPathLevelClasses[_GPF_XML_XPATH_TOKEN.SUB] = _GpfXmlXPathSub;
_gpfXmlXPathLevelClasses[_GPF_XML_XPATH_TOKEN.DEEP] = _GpfXmlXPathDeep;

function _gpfXmlXPathConsumeIfTokenMatch (tokens) {
    var expected = _gpfArrayTail(arguments),
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

function _gpfXmlXPathCheckAndConsumeIfTokenMatch () {
    var token = _gpfXmlXPathConsumeIfTokenMatch.apply(null, arguments);
    if (!token) {
        gpf.Error.invalidXPathSyntax();
    }
    return token;
}

// <_gpfXmlXPathStart> -> <_gpfXmlXPathLevel> (CONCAT <_gpfXmlXPathLevel>)?
// <_gpfXmlXPathLevel> -> (CURRENT? (SUB|DEEP))? <_gpfXmlXPathMatch> ( (SUB|DEEP) <_gpfXmlXPathMatch> )*
// <_gpfXmlXPathMatch> -> ATTRIBUTE? NAMESPACE_PREFIX? (NAME|ANY) (CONDITION_OPEN <condition>)?
// <condition> -> <_gpfXmlXPathLevel> CONDITION_CLOSE

function _gpfXmlXPathMatch (tokens) {
    var isAttribute = _gpfXmlXPathConsumeIfTokenMatch(tokens, _GPF_XML_XPATH_TOKEN.ATTRIBUTE),
        namespacePrefix = _gpfXmlXPathConsumeIfTokenMatch(tokens, _GPF_XML_XPATH_TOKEN.NAMESPACE_PREFIX),
        any = _gpfXmlXPathConsumeIfTokenMatch(tokens, _GPF_XML_XPATH_TOKEN.ANY),
        name;

    function getName () {
        if (any) {
            return "";
        }
        return _gpfXmlXPathCheckAndConsumeIfTokenMatch(tokens, _GPF_XML_XPATH_TOKEN.NAME)[_GPF_XML_XPATH_TOKEN.NAME];
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

function _gpfXmlXPathLevel (tokens) {
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
        relative = Boolean(_gpfXmlXPathConsumeIfTokenMatch(tokens, _GPF_XML_XPATH_TOKEN.CURRENT));
        subOrDeep = _gpfXmlXPathConsumeIfTokenMatch(tokens, _GPF_XML_XPATH_TOKEN.SUB, _GPF_XML_XPATH_TOKEN.DEEP);
        if (!subOrDeep) {
            firstLevelNoSubOrDeep();
        }
    }

    firstLevel();
    while (subOrDeep) {
        operator = new _gpfXmlXPathLevelClasses[subOrDeep.token](relative);
        operator.addChild(_gpfXmlXPathMatch(tokens));
        chain.addChild(operator);
        relative = true;
        subOrDeep = _gpfXmlXPathConsumeIfTokenMatch(tokens, _GPF_XML_XPATH_TOKEN.SUB, _GPF_XML_XPATH_TOKEN.DEEP);
    }
    return chain.reduce();
}

function _gpfXmlXPathStart (tokens) {
    var concat = new _GpfXmlXPathConcat();
    concat.addChild(_gpfXmlXPathLevel(tokens));
    while (_gpfXmlXPathConsumeIfTokenMatch(tokens, _GPF_XML_XPATH_TOKEN.CONCAT)) {
        concat.addChild(_gpfXmlXPathLevel(tokens));
    }
    return concat.reduce();
}

/**
 * Parse the XPath expression
 *
 * @param {String} xpathExpression XPath expression to evaluate
 * @return {Object} Parsed expression
 * @since 1.0.1
 */
function _gpfXmlXPathParse (xpathExpression) {
    var tokens = _gpfRegExpTokenize(_GPF_XML_XPATH_TOKEN.regexp, xpathExpression, true),
        xpath = _gpfXmlXPathStart(tokens);
    if (tokens.length) {
        gpf.Error.invalidXPathSyntax();
    }
    return xpath;
}

/**
 * @gpf:sameas _gpfXmlXPathParse
 * @since 1.0.1
 */
gpf.xml.xpath.parse = _gpfXmlXPathParse;
