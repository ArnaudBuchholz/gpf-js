/**
 * @file XML XPath evaluation
 * @since 1.0.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfXmlXPathParse*/ // gpf.xml.Parser
/*#endif*/

/**
 * Parse and evaluate the XPath on the give node
 *
 * @param {String} xpathExpression XPath expression to evaluate
 * @param {gpf.interfaces.IXmlNodeSyncAdapter} contextNode Context node of the evaluation
 * @param {Object} [namespaces={}] Dictionary associating namespace prefix to a namespace URI
 * @return {gpf.interfaces.IXmlNodeSyncAdapter[]} List of matching nodes
 * @since 1.0.1
 */
function _gpfXmlXPathSelect (xpathExpression, contextNode, namespaces) {
    return _gpfXmlXPathParse(xpathExpression).execute(contextNode, namespaces);
}

gpf.xml.xpath = {

    /**
     * @gpf:sameas _gpfXmlXPathSelect
     * @since 1.0.1
     */
    select: _gpfXmlXPathSelect

};
