/**
 * @file XML XPath Concat object
 * @since 1.0.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfIgnore*/
/*global _gpfDefine*/
/*global _gpfXmlXPathBase*/
/*exported _gpfXmlXPathConcat*/
/*#endif*/

var _gpfXmlXPathConcat = _gpfDefine({
    $class: "gpf.xml.xpath.Concat",
    $extend: _gpfXmlXPathBase,

    _xpath: [],

    /**
     * @inheritdoc
     * @since 1.0.1
     */
    select: function (contextNode, namespaces) {
        return this._xpath.reduce(function (nodes, xpath) {
            nodes = nodes.concat(xpath.evaluate(contextNode, namespaces));
        }, []);
    },

    /**
     * Implementation of the | operator
     *
     * @class gpf.xml.xpath.Concat
     * @since 1.0.1
     */
    constructor: function () {
        this._xpath = [];
    }
});
