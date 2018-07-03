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
 * IXmlContentHandler interface specifier
 *
 * @type {gpf.interfaces.IXmlContentHandler}
 */
var _gpfIXmlContentHandler = _gpfDefineInterface("XmlContentHandler",
    _gpfSyncReadSourceJSON("interfaces/xmlcontenthandler.json"));
