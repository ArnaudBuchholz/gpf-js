/**
 * @file XML XPath Match operator
 * @since 1.0.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_XML_NODE_TYPE*/
/*global _gpfDefine*/
/*global _GpfXmlXPathBase*/ // gpf.xml.xpath.Base
/*exported _GpfXmlXPathMatch*/ // gpf.xml.xpath.Match
/*#endif*/

/**
 * Implementation of the matching operator: @?(ns:)?(name|*)
 *
 * @class gpf.xml.xpath.Match
 * @extend gpf.xml.xpath.Base
 * @since 1.0.1
 */
var _GpfXmlXPathMatch = _gpfDefine({
    $class: "gpf.xml.xpath.Match",
    $extend: _GpfXmlXPathBase,

    _isAttribute: false,
    _namespacePrefix: "",
    _name: "",

    _matchNodeType: function (nodeType) {
        if (this._isAttribute) {
            return nodeType === _GPF_XML_NODE_TYPE.ATTRIBUTE;
        }
        return nodeType === _GPF_XML_NODE_TYPE.ELEMENT;
    },

    _matchNodeName: function (contextNode) {
        if (this._name === contextNode.getLocalName()) {
            return true;
        }
    },

    _matchName: function (contextNode) {
        if (this._name) {
            return this._matchNodeName(contextNode);
        }
        return true;
    },

    _matchNamespace: function (contextNode, namespaces) {
        var namespace = namespaces[this._namespacePrefix];
        if (namespace === contextNode.getNamespaceURI()) {
            return this._matchName(contextNode);
        }
    },

    _matchNode: function (contextNode, namespaces) {
        if (this._namespacePrefix) {
            return this._matchNamespace(contextNode, namespaces);
        }
        return this._matchName(contextNode);
    },

    _match: function (contextNode, namespaces) {
        if (this._matchNodeType(contextNode.getNodeType())) {
            return this._matchNode(contextNode, namespaces);
        }
    },

    /**
     * @inheritdoc
     * @since 1.0.1
     */
    execute: function (contextNode, namespaces) {
        if (this._match(contextNode, namespaces)) {
            return [contextNode];
        }
        return [];
    },

    _toAttributeString: function (result) {
        if (this._isAttribute) {
            result.push("@");
        }
    },

    _toNamespaceString: function (result) {
        if (this._namespacePrefix) {
            result.push(this._namespacePrefix, ":");
        }
    },

    _toNameString: function (result) {
        if (this._name) {
            result.push(this._name);
        } else {
            result.push("*");
        }
    },

    /**
     * @inheritdoc
     * @since 1.0.1
     */
    toString: function () {
        var result = [];
        this._toAttributeString(result);
        this._toNamespaceString(result);
        this._toNameString(result);
        return result.join("");
    },

    constructor: function (isAttribute, namespacePrefix, name) {
        this.$super();
        this._isAttribute = isAttribute;
        this._namespacePrefix = namespacePrefix;
        this._name = name;
    }
});
