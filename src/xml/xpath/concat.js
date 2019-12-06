/**
 * @file XML XPath Concat operator
 * @since 1.0.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfXmlXPathBase*/ // gpf.xml.xpath.Base
/*global _gpfDefine*/ // Shortcut for gpf.define
/*exported _GpfXmlXPathConcat*/ // gpf.xml.xpath.Concat
/*exported _gpfXmlXpathConcatNodes*/ // Returns a list of unique nodes
/*#endif*/

/**
 * Concat the node lists to ensure the result contain only unique nodes
 * @param {gpf.interfaces.IXmlNodeSyncAdapter[]} currentNodes List of nodes to concatenate with
 * @param {gpf.interfaces.IXmlNodeSyncAdapter[]} newNodes List of nodes to add in the currentNodes list
 * @return {gpf.interfaces.IXmlNodeSyncAdapter[]} List of unique nodes
 * @since 1.0.1
 */
function _gpfXmlXpathConcatNodes (currentNodes, newNodes) {
    return currentNodes.concat(newNodes.filter(function (node) {
        return !currentNodes.includes(node);
    }));
}

/**
 * Implementation of the | operator
 *
 * @class gpf.xml.xpath.Concat
 * @extend gpf.xml.xpath.Base
 * @since 1.0.1
 */
var _GpfXmlXPathConcat = _gpfDefine({
    $class: "gpf.xml.xpath.Concat",
    $extend: _GpfXmlXPathBase,

    /**
     * @inheritdoc
     * @since 1.0.1
     */
    execute: function (contextNode, namespaces) {
        return this._children.reduce(function (nodes, xpath) {
            return _gpfXmlXpathConcatNodes(nodes, xpath.execute(contextNode, namespaces));
        }, []);
    },

    /**
     * @inheritdoc
     * @since 1.0.1
     */
    toString: function () {
        return this._children.map(function (operator) {
            return operator.toString();
        }).join(" | ");
    }
});
