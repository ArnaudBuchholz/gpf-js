/**
 * @file XML XPath Chain operator
 * @since 1.0.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/
/*global _gpfArrayTail*/
/*global _GpfXmlXPathBase*/
/*global _gpfXmlXpathConcatNodes*/ // Returns a list of unique nodes
/*exported _GpfXmlXPathChain*/ // gpf.xml.xpath.Chain
/*#endif*/

/**
 * Implementation of the chain operator
 *
 * @class gpf.xml.xpath.Chain
 * @extend gpf.xml.xpath.Base
 * @since 1.0.1
 */
var _GpfXmlXPathChain = _gpfDefine({
    $class: "gpf.xml.xpath.Chain",
    $extend: _GpfXmlXPathBase,

    /**
     * @inheritdoc
     * @since 1.0.1
     */
    execute: function (rootContextNode, namespaces) {
        var nodes = [rootContextNode];
        this._children.forEach(function (operator) {
            nodes = nodes.reduce(function (resultNodes, contextNode) {
                return _gpfXmlXpathConcatNodes(resultNodes, operator.execute(contextNode, namespaces));
            }, []);
        });
        return nodes;
    },

    /**
     * @inheritdoc
     * @since 1.0.1
     */
    toString: function () {
        return [
            this._children[0].toString()
        ].concat(_gpfArrayTail(this._children).map(function (operator) {
            if (operator.toRelativeString) {
                return operator.toRelativeString();
            }
            return operator.toString();
        })).join("");
    }
});
