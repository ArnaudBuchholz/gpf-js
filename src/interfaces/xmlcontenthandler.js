/**
 * @file IXmlContentHandler interface
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefineInterface*/ // Internal interface definition helper
/*global _gpfSyncReadSourceJSON*/ // Reads a source json file (only in source mode)
/*exported _gpfIXmlContentHandler*/ // gpf.interfaces.IXmlContentHandler
/*#endif*/

/**
 * Interface used to serialize XML files, the SAX way
 *
 * @interface gpf.interfaces.IXmlContentHandler
 */

/**
 * Signal character data
 *
 * @method gpf.interfaces.IXmlContentHandler#characters
 * @param {String} buffer characters
 */

/**
 * Signal the end of the document
 *
 * @method gpf.interfaces.IXmlContentHandler#endDocument
 * @return {Promise} Resolved when ready
 */

/**
 * Signal the end of an element
 *
 * @method gpf.interfaces.IXmlContentHandler#endElement
 * @return {Promise} Resolved when ready
 */

/**
 *  Signal the scope end of a prefix-URI namespace mapping
 *
 * @method gpf.interfaces.IXmlContentHandler#endPrefixMapping
 * @param {String} prefix Prefix of the prefix-URI mapping
 * @return {Promise} Resolved when ready
 */

/**
 * Signal a processing instruction
 *
 * @method gpf.interfaces.IXmlContentHandler#processingInstruction
 * @param {String} target Target of processing instruction
 * @param {String} data Data of processing instruction
 * @return {Promise} Resolved when ready
 */

/**
 * Signal the beginning of the document
 *
 * @method gpf.interfaces.IXmlContentHandler#startDocument
 * @return {Promise} Resolved when ready
 */

/**
 * Signal the beginning of an element
 *
 * @method gpf.interfaces.IXmlContentHandler#startElement
 * @param {String} qName Qualified name, [prefix:]localName
 * @param {Object} [attributes={}] attribute dictionary (string/string)
 * @return {Promise} Resolved when ready
 */

/**
 * Signal the scope start a prefix-URI namespace mapping
 *
 * @method gpf.interfaces.IXmlContentHandler#startPrefixMapping
 * @param {String} prefix Prefix of the prefix-URI mapping
 * @param {String} uri Namespace URI associated with the prefix
 * @return {Promise} Resolved when ready
 */

/**
 * IXmlContentHandler interface specifier
 *
 * @type {gpf.interfaces.IXmlContentHandler}
 */
var _gpfIXmlContentHandler = _gpfDefineInterface("XmlContentHandler",
    _gpfSyncReadSourceJSON("interfaces/xmlcontenthandler.json"));
