/**
 * @file XML XPath Base object
 * @since 1.0.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_START*/ // 0
/*global _gpfArrayTail*/ // [].slice.call(,1)
/*global _gpfCreateAbstractFunction*/ // Build a function that throws the abstractMethod exception
/*global _gpfDefine*/ // Shortcut for gpf.define
/*exported _GpfXmlXPathBase*/ // gpf.xml.xpath.Base
/*#endif*/

var _GpfXmlXPathBase = _gpfDefine({
    $class: "gpf.xml.xpath.Base",

    _children: [],

    /**
     * Get the child operators
     *
     * @return {gpf.xml.xpath.Base[]} List of child operators
     * @since 1.0.1
     */
    getChildren: function () {
        return this._children;
    },

    /**
     * Add a child operator
     *
     * @param {gpf.xml.xpath.Base} operator Child operator
     * @since 1.0.1
     */
    addChild: function (operator) {
        this._children.push(operator);
    },

    /**
     * If it contains only one child operator, returns it
     * Otherwise, returns the current operator.
     *
     * @return {gpf.xml.xpath.Base} Reduced operator
     * @since 1.0.1
     */
    reduce: function () {
        var children = this.getChildren();
        if (!_gpfArrayTail(children).length) {
            return children[_GPF_START];
        }
        return this;
    },

    /**
     * Execute the operator
     *
     * @param {gpf.interfaces.IXmlNodeSyncAdapter} contextNode Context node of the evaluation
     * @param {Object} [namespaces={}] Dictionary associating namespace prefix to a namespace URI
     * @return {gpf.interfaces.IXmlNodeSyncAdapter[]} List of matching nodes
     * @abstract
     * @since 1.0.1
     */
    execute: _gpfCreateAbstractFunction(2), //eslint-disable-line no-magic-numbers

    /**
     * Converts the operator to an XPATH string
     * @return {String} textual representation of the operator
     * @abstract
     * @since 1.0.1
     */
    toString: _gpfCreateAbstractFunction(),

    /**
     * Base class for all XPath operators
     *
     * @constructor gpf.xml.xpath.Base
     * @abstract
     * @since 1.0.1
     */
    constructor: function () {
        this._children = [];
    }
});
