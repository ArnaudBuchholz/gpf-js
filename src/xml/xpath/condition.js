/**
 * @file XML XPath Condition operator
 * @since 1.0.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_START*/ // 0
/*global _GpfXmlXPathBase*/ // gpf.xml.xpath.Base
/*global _gpfDefine*/ // Shortcut for gpf.define
/*exported _GpfXmlXPathCondition*/ // gpf.xml.xpath.Condition
/*#endif*/

/**
 * Implementation of the condition operator
 *
 * @class gpf.xml.xpath.Condition
 * @extend gpf.xml.xpath.Base
 * @since 1.0.1
 */
var _GpfXmlXPathCondition = _gpfDefine({
    $class: "gpf.xml.xpath.Condition",
    $extend: _GpfXmlXPathBase,

    /**
     * @inheritdoc
     * @since 1.0.1
     */
    execute: function (rootContextNode, namespaces) {
        var passing = this._children.every(function (operator) {
                return !!operator.execute([rootContextNode], namespaces).length;
            });
        if (passing) {
            return [rootContextNode];
        }
        return [];
    },

    /**
     * @inheritdoc
     * @since 1.0.1
     */
    toString: function () {
        return [
            this._children[_GPF_START].toString()
        ].concat(_gpfArrayTail(this._children).map(function (operator) {
            return operator.toRelativeString();
        })).join("");
    }
});
