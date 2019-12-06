/**
 * @file IXmlNodeSyncAdapter interface
 * @since 1.0.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefineInterface*/ // Internal interface definition helper
/*global _gpfSyncReadSourceJSON*/ // Reads a source json file (only in source mode)
/*exported _GPF_XML_NODE_TYPE*/ // XML Node types
/*exported _gpfIXmlNodeSyncAdapter*/ // gpf.interfaces.IXmlNodeSyncAdapter
/*#endif*/

/**
 * The IXmlNodeSyncAdapter interface allows exploration (i.e. read-only access) of objects that looks like XML node:
 * they have children and parent nodes, attributes and namespace feature
 *
 * @interface gpf.interfaces.IXmlNodeSyncAdapter
 * @since 1.0.1
 */

/**
 * IXmlNodeSyncAdapter Node type constants
 * @since 1.0.1
 */
var _GPF_XML_NODE_TYPE = {
    ELEMENT: 1,
    ATTRIBUTE: 2,
    TEXT: 3,
    DOCUMENT: 9
};

/**
 * IXmlNodeSyncAdapter Node type enumeration
 *
 * @enum {Number}
 * @readonly
 * @since 1.0.1
 */
gpf.xml.nodeType = {
    /**
     * An Element node like <p> or <div>
     * @since 1.0.1
     */
    element: _GPF_XML_NODE_TYPE.ELEMENT,
    /**
     * An Attribute of an Element
     * @since 1.0.1
     */
    attribute: _GPF_XML_NODE_TYPE.ATTRIBUTE,
    /**
     * The actual Text inside an Element
     * @since 1.0.1
     */
    text: _GPF_XML_NODE_TYPE.TEXT,
    /**
     * A Document node
     * @since 1.0.1
     */
    document: _GPF_XML_NODE_TYPE.DOCUMENT
};

/**
 * Get attribute nodes from the current element, valid for
 * - {@link gpf.xml.nodeType.element}
 *
 * @method gpf.interfaces.IXmlNodeSyncAdapter#getAttributes
 * @return {gpf.interfaces.IXmlNodeSyncAdapter[]|null} Attribute nodes (`null` if not the right type)
 * @since 1.0.1
 */

/**
 * Get child nodes from the current element, valid for
 * - {@link gpf.xml.nodeType.element}
 *
 * @method gpf.interfaces.IXmlNodeSyncAdapter#getChildNodes
 * @return {gpf.interfaces.IXmlNodeSyncAdapter[]|null} Child nodes (`null` if not the right type)
 * @since 1.0.1
 */

/**
 * Get node local name, valid for
 * - {@link gpf.xml.nodeType.element}
 * - {@link gpf.xml.nodeType.attribute}
 *
 * @method gpf.interfaces.IXmlNodeSyncAdapter#getLocalName
 * @return {String|null} Local name (`null` if not the right type)
 * @since 1.0.1
 */

/**
 * Get node namespace URI, valid for
 * - {@link gpf.xml.nodeType.element}
 * - {@link gpf.xml.nodeType.attribute}
 *
 * @method gpf.interfaces.IXmlNodeSyncAdapter#getNamespaceURI
 * @return {String|null} Namespace URI (`null` if not the right type)
 * @since 1.0.1
 */

/**
 * Get node type
 *
 * @method gpf.interfaces.IXmlNodeSyncAdapter#getNodeType
 * @return {gpf.xml.nodeType} Node type
 * @since 1.0.1
 */

/**
 * Get node value, valid for
 * - {@link gpf.xml.nodeType.attribute}
 * - {@link gpf.xml.nodeType.text}
 *
 * @method gpf.interfaces.IXmlNodeSyncAdapter#getNodeValue
 * @return {String|null} Value (`null` if not the right type)
 * @since 1.0.1
 */

/**
 * Get parent node from the current element, valid for
 * - {@link gpf.xml.nodeType.element}
 *
 * @method gpf.interfaces.IXmlNodeSyncAdapter#getParentNode
 * @return {gpf.interfaces.IXmlNodeSyncAdapter|null} Parent node (`null` if not the right type)
 * @since 1.0.1
 */

/**
 * IXmlNodeSyncAdapter interface specifier
 *
 * @type {gpf.interfaces.IXmlNodeSyncAdapter}
 * @since 1.0.1
 */
var _gpfIXmlNodeSyncAdapter = _gpfDefineInterface("XmlNodeSyncAdapter",
    _gpfSyncReadSourceJSON("interfaces/xmlnodesyncadapter.json"));

/*#ifndef(UMD)*/

// Generates an empty function to reflect the null complexity of this module
(function _gpfInterfacesXmlnodesyncadapter () {}());

/*#endif*/
