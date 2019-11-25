/**
 * @file XML XPath Base object
 * @since 1.0.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfIgnore*/
/*global _gpfDefine*/
/*exported _gpfXmlXPathBase*/
/*#endif*/

/**
 * Base class for all XPath objects
 *
 * @class gpf.xml.xpath.Base
 * @since 1.0.1
 */
var _gpfXmlXPathBase = _gpfDefine({
    $class: "gpf.xml.xpath.Base",

    /**
     * Apply the current selection operator
     *
     * @param {gpf.interfaces.IXmlNodeSyncAdapter} contextNode Context node of the evaluation
     * @param {Object} [namespaces={}] Dictionary associating namespace prefix to a namespace URI
     * @return {gpf.interfaces.IXmlNodeSyncAdapter[]} List of matching nodes
     */
    select: function (contextNode, namespaces) {
        _gpfIgnore(contextNode, namespaces);
        return [];
    }
});
