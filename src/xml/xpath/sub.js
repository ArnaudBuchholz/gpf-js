/**
 * @file XML XPath child search operator
 * @since 1.0.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAssert*/ // Assertion method
/*global _gpfDefine*/
/*global _GpfXmlXPathBase*/
/*global _gpfXmlXpathConcatNodes*/
/*exported _gpfXmlXPathSub*/ // gpf.xml.xpath.Sub
/*#endif*/

/**
 * Implementation of the / operator
 *
 * @class gpf.xml.xpath.Sub
 * @extend gpf.xml.xpath.Base
 * @since 1.0.1
 */
var _gpfXmlXPathSub = _gpfDefine({
    $class: "gpf.xml.xpath.Sub",
    $extend: _gpfXmlXPathBase,

    _lookupChildNodes (operator, childNodes, namespaces) {
        var nodes = [];
        if (childNodes) {
            childNodes.forEach(function (child) {
                nodes = _gpfXmlXpathConcatNodes(nodes, operator(child, namespaces));
            });
        }
        return nodes;
    },

    _lookup: function (operator, node, namespaces) {
        return _gpfXmlXpathConcatNodes(
            this._lookupChildNodes(operator, node.getChildNodes(), namespaces),
            this._lookupChildNodes(operator, node.getAttributes(), namespaces)
        );
    },

    _getOperator: function () {
        _gpfAssert(this._children.length === 1, "Only one child operator expected");
        return this._children[0];
    },

    /**
     * @inheritdoc
     * @since 1.0.1
     */
    execute: function (contextNode, namespaces) {
        return this._lookup(this._getOperator(), contextNode, namespaces);
    }
});
