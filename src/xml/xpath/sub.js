/**
 * @file XML XPath child search operator
 * @since 1.0.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_START*/ // 0
/*global _GpfXmlXPathBase*/ // gpf.xml.xpath.Base
/*global _gpfArrayTail*/ // [].slice.call(,1)
/*global _gpfAssert*/ // Assertion method
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfXmlXpathConcatNodes*/ // Returns a list of unique nodes
/*exported _GpfXmlXPathSub*/ // gpf.xml.xpath.Sub
/*#endif*/

function _gpfXmlXPathGetRoot (contextNode) {
    var current,
        parent = contextNode;
    while (parent) {
        current = parent;
        parent = current.getParentNode();
    }
    return current;
}

var _GpfXmlXPathSub = _gpfDefine({
    $class: "gpf.xml.xpath.Sub",
    $extend: _GpfXmlXPathBase,

    _relative: true,

    _lookupChildNodes: function (operator, childNodes, namespaces) {
        var nodes = [];
        if (childNodes) {
            childNodes.forEach(function (child) {
                nodes = _gpfXmlXpathConcatNodes(nodes, operator.execute(child, namespaces));
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

    resolveContextNode: function (contextNode) {
        if (this._relative) {
            return contextNode;
        }
        return _gpfXmlXPathGetRoot(contextNode);
    },

    /**
     * @inheritdoc
     * @since 1.0.1
     */
    execute: function (contextNode, namespaces) {
        return this._lookup(this._getOperator(), this.resolveContextNode(contextNode), namespaces);
    },

    toRelativeString: function () {
        return "/" + this._children[_GPF_START].toString();
    },

    /**
     * @inheritdoc
     * @since 1.0.1
     */
    toString: function () {
        var relativeString = this.toRelativeString();
        if (this._relative) {
            return "." + relativeString;
        }
        return relativeString;
    },

    /**
     * Implementation of the / operator
     *
     * @constructor gpf.xml.xpath.Sub
     * @param {Boolean} relative Search is relative to context node (or from the root)
     * @extend gpf.xml.xpath.Base
     * @since 1.0.1
     */
    constructor: function (relative) {
        this.$super();
        this._relative = relative;
    }
});
