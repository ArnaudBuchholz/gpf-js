/**
 * @file XML XPath evaluation
 * @since 1.0.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfIgnore*/
/*#endif*/

_gpfErrorDeclare("xml/xpath", {
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

/**
 * Parse and evaluate the XPath on the give node
 *
 * @param {String} xpathExpression XPath expression to evaluate
 * @param {gpf.interfaces.IXmlNode} contextNode Context node of the evaluation
 * @param {Object} namespaces Dictionary associating namespace prefix to a namespace URI
 * @return {gpf.interfaces.IXmlNode[]} List of matching nodes
 */
function _gpfXmlXPathEvaluate (xpathExpression, contextNode, namespaces) {
    _gpfIgnore(xpathExpression, contextNode, namespaces);
    return [];
}
