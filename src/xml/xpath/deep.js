/**
 * @file XML XPath Deep search operator
 * @since 1.0.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_START*/ // 0
/*global _GpfXmlXPathSub*/ // gpf.xml.xpath.Sub
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfXmlXpathConcatNodes*/ // Returns a list of unique nodes
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
            innerOperator = me.$super(),
            recursiveOperator = {
                execute: function (contextNode, namespaces) {
                    return _gpfXmlXpathConcatNodes(
                        innerOperator.execute(contextNode, namespaces),
                        me._lookup(recursiveOperator, contextNode, namespaces)
                    );
                }
            };
        return recursiveOperator;
    },

    toRelativeString: function () {
        return "//" + this._children[_GPF_START].toString();
    }
});
