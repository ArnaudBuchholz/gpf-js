/**
 * @file XML XPath child search operator
 * @since 1.0.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_START*/
/*global _gpfAssert*/ // Assertion method
/*global _gpfArrayTail*/
/*global _gpfDefine*/
/*global _GpfXmlXPathBase*/
/*global _gpfXmlXpathConcatNodes*/
/*exported _GpfXmlXPathSub*/ // gpf.xml.xpath.Sub
/*#endif*/

/**
 * Implementation of the / operator
 *
 * @class gpf.xml.xpath.Sub
 * @extend gpf.xml.xpath.Base
 * @since 1.0.1
 */
var _GpfXmlXPathSub = _gpfDefine({
    $class: "gpf.xml.xpath.Sub",
    $extend: _GpfXmlXPathBase,

    _lookupChildNodes: function (operator, childNodes, namespaces) {
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
        _gpfAssert(!_gpfArrayTail(this._children).length, "Only one child operator expected");
        return this._children[_GPF_START];
    },

    /**
     * @inheritdoc
     * @since 1.0.1
     */
    execute: function (contextNode, namespaces) {
        return this._lookup(this._getOperator(), contextNode, namespaces);
    }
});
