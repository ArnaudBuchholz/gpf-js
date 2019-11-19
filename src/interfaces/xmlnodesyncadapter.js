/**
 * @file IXmlNodeSyncAdapter interface
 * @since 1.0.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefineInterface*/ // Internal interface definition helper
/*global _gpfInterfaceQuery*/ // gpf.interfaces.query
/*global _gpfSyncReadSourceJSON*/ // Reads a source json file (only in source mode)
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
  */
_GPF_XML_NODE_TYPE = {
    ELEMENT: 1,
    ATTRIBUTE: 2,
    TEXT: 3
};

/**
 * IXmlNodeSyncAdapter Node type enumeration
 *
 * @enum {Number}
 * @readonly
 * @since 1.0.1
 */
gpf.xml.xmlNodeSyncAdapterNodeType = {
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
    text: _GPF_XML_NODE_TYPE.TEXT
};


/**
 * Get attribute nodes from the current element (valid only for {@link gpf.xml.xmlNodeSyncAdapterType.element}).
 *
 * @method gpf.interfaces.IXmlNodeSyncAdapter#getAttributes
 * @return {gpf.interfaces.IXmlNodeSyncAdapter[]|null} Attribute nodes
 * (`null` if not {@link gpf.xml.xmlNodeSyncAdapterType.element})
 * @since 1.0.1
 */

/**
 * Get child nodes from the current element (valid only for {@link gpf.xml.xmlNodeSyncAdapterType.element}).
 *
 * @method gpf.interfaces.IXmlNodeSyncAdapter#getChildNodes
 * @return {gpf.interfaces.IXmlNodeSyncAdapter[]|null} Child nodes
 * (`null` if not {@link gpf.xml.xmlNodeSyncAdapterType.element})
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
