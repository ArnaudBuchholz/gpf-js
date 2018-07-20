/**
 * @file XML Validation helpers
 */
 /*#ifndef(UMD)*/
 "use strict";
 /*global _gpfErrorDeclare*/ // Declare new gpf.Error names
 /*exported _gpfXmlCheckValidElementName*/ // Check XML element name
 /*exported _gpfXmlCheckValidAttributeName*/ // Check XML attribute name
 /*exported _gpfXmlCheckValidNamespacePrefixName*/ // Check XML namespace prefix name
 /*#endif*/

 _gpfErrorDeclare("xml/validation", {

     /**
      * ### Summary
      *
      * Invalid XML element name
      *
      * ### Description
      *
      * Invalid XML element name
      */
     invalidXmlElementName: "Invalid XML element name",

     /**
      * ### Summary
      *
      * Invalid XML attribute name
      *
      * ### Description
      *
      * Invalid XML attribute name
      */
     invalidXmlAttributeName: "Invalid XML attribute name",

     /**
      * ### Summary
      *
      * Invalid XML namespace prefix
      *
      * ### Description
      *
      * Invalid XML namespace prefix
      */
     invalidXmlNamespacePrefix: "Invalid XML namespace prefix",

     /**
      * ### Summary
      *
      * Invalid use of XML namespace prefix xmlns
      *
      * ### Description
      *
      * Invalid use of XML namespace prefix xmlns: startPrefixMapping should be used instead
      */
     invalidXmlUseOfPrefixXmlns: "Invalid use of XML namespace prefix xmlns",

     /**
      * ### Summary
      *
      * Invalid use of XML namespace prefix xml
      *
      * ### Description
      *
      * Invalid use of XML namespace prefix xml: only xml:space is allowed
      */
     invalidXmlUseOfPrefixXml: "Invalid use of XML namespace prefix xml",

     /**
      * ### Summary
      *
      * Unknown XML namespace prefix
      *
      * ### Description
      *
      * This error is triggered when an element or an attribute is prefixed with an unknown namespace prefix
      */
     unknownXmlNamespacePrefix: "Unknown XML namespace prefix"

 });

 function _gpfXmlGetChecker (regexp, exception) {
     return function (name) {
         if (!name.match(regexp)) {
             gpf.Error[exception]();
         }
     };
 }

var
    _gpfXmlNameValidation = new RegExp("^[a-zA-Z_][a-zA-Z0-9_\\-\\.]*$"),
    _gpfXmlNamespacePrefixValidation = new RegExp("^(|[a-z_][a-zA-Z0-9_]*)$"),

    /**
     * Check XML element name
     *
     * @param {String} name Element name to check
     * @throws {gpf.Error.InvalidXmlElementName}
     */
    _gpfXmlCheckValidElementName = _gpfXmlGetChecker(_gpfXmlNameValidation, "invalidXmlElementName"),

    /**
     * Check XML attribute name
     *
     * @param {String} name Attribute name to check
     * @throws {gpf.Error.InvalidXmlAttributeName}
     */
     _gpfXmlCheckValidAttributeName = _gpfXmlGetChecker(_gpfXmlNameValidation, "invalidXmlAttributeName"),

     /**
      * Check XML namespace prefix name
      *
      * @param {String} name Namespace prefix name to check
      * @throws {gpf.Error.InvalidXmlNamespacePrefixName}
      */
      _gpfXmlCheckValidNamespacePrefixName =
        _gpfXmlGetChecker(_gpfXmlNamespacePrefixValidation, "invalidXmlNamespacePrefix");

function _gpfXmlCheckQualifiedElementNameAndPrefix (name, prefix, knownPrefixes) {
    _gpfXmlCheckValidElementName(name);
    _gpfXmlCheckValidNamespacePrefixName(prefix);
    if (prefix === "xmlns") {
        gpf.Error.invalidXmlUseOfPrefixXmlns();
    }
    if (prefix !== "xml") {
        if (knownPrefixes.indexOf(prefix) === -1) {
            gpf.Error.unknownXmlNamespacePrefix();
        }
    } else {
        // only allow xml:space (xml:lang is ignored for now)
        if (name !== "space") {
            gpf.Error.invalidXmlUseOfPrefixXml();
        }
    }
}

/**
 * Check the qualified element name
 *
 * @param {String} qName Element qualified name to check
 * @param {String[]} knownPrefixes Known namespaces prefixes
 *
 * @throws {gpf.Error.InvalidXmlElementName}
 */
function _gpfXmlCheckQualifiedElementName (qName, knownPrefixes) {
    var sep = qName.indexOf(":");
    if (-1 === sep) {
        _gpfXmlCheckValidElementName(qName);
    } else {
        _gpfXmlCheckQualifiedElementNameAndPrefix(qName.substr(0, sep), qName.substr(sep + 1), knownPrefixes);
    }
}
