/**
 * @file XML XPath Deep search operator
 * @since 1.0.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAssert*/ // Assertion method
/*global _gpfDefine*/
/*global _gpfXmlXpathConcatNodes*/
/*global _GpfXmlXPathSub*/ // gpf.xml.xpath.Sub
/*exported _GpfXmlXPathDeep*/ // gpf.xml.xpath.Deep
/*#endif*/

/**
 * Implementation of the // operator
 *
 * @class gpf.xml.xpath.Deep
 * @extend gpf.xml.xpath.Sub
 * @since 1.0.1
 */
 var _GpfXmlXPathDeep = _gpfDefine({
    $class: "gpf.xml.xpath.Deep",
    $extend: _GpfXmlXPathSub,

    _getOperator: function () {
        var me = this,
            operator = me.$super();
        return function recursiveOperator (contextNode, namespaces) {
            return _gpfXmlXpathConcatNodes(
                operator.execute(contextNode, namespaces),
                me._lookup(recursiveOperator, contextNode, namespaces)
            );
        };
    },

    _toSearchString: function () {
        return "//" + this._children[0].toString();
    }
});
