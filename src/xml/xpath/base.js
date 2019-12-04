/**
 * @file XML XPath Base object
 * @since 1.0.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfIgnore*/
/*global _gpfDefine*/
/*exported _GpfXmlXPathBase*/ // gpf.xml.xpath.Base
/*#endif*/

var _GpfXmlXPathBase = _gpfDefine({
    $class: "gpf.xml.xpath.Base",

    _children: [],

    /**
     * Get the child operators
     *
     * @return {gpf.xml.xpath.Base[]} List of child operators
     */
    getChildren: function () {
        return this._children;
    },

    /**
     * Add a child operator
     *
     * @param {gpf.xml.xpath.Base} operator Child operator
     */
    addChild: function (operator) {
        this._children.push(operator);
    },

    /**
     * Execute the operator
     *
     * @param {gpf.interfaces.IXmlNodeSyncAdapter} contextNode Context node of the evaluation
     * @param {Object} [namespaces={}] Dictionary associating namespace prefix to a namespace URI
     * @return {gpf.interfaces.IXmlNodeSyncAdapter[]} List of matching nodes
     */
    execute: function (contextNode, namespaces) {
        _gpfIgnore(contextNode, namespaces);
        return [];
    },

    /**
     * Converts the operator to an XPATH string
     * @since 1.0.1
     */
    toString: function () {
        return "";
    },

    /**
     * Base class for all XPath operators
     *
     * @constructor gpf.xml.xpath.Base
     * @since 1.0.1
     */
    constructor: function () {
        this._children = [];
    }
});
