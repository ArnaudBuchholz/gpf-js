/**
* @file XML Validation helpers
*/
/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*exported _gpfXmlCheckValidElementName*/ // Check XML element name
/*exported _gpfXmlCheckValidAttributeName*/ // Check XML attribute name
/*exported _gpfXmlCheckValidNamespacePrefixName*/ // Check XML namespace prefix name
/*exported _gpfXmlCheckQualifiedElementName*/ // Check XML qualified element name
/*exported _gpfXmlCheckQualifiedAttributeName*/ // Check XML qualified attribute name
/*#endif*/

_gpfErrorDeclare("xml/check", {

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
    * Invalid use of XML namespace prefix xml: only xml:space="preserve" is allowed
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

function _gpfXmlCheckBuildSimple (regexp, exception) {
    return function (name) {
        if (!name.match(regexp)) {
            gpf.Error["invalidXml" + exception]();
        }
    };
}

var
    _gpfXmlCheckNameRegExp = new RegExp("^[a-zA-Z_][a-zA-Z0-9_\\-\\.]*$"),
    _gpfXmlNamespacePrefixRegExp = new RegExp("^(|[a-z_][a-zA-Z0-9_]*)$"),

    /**
     * Check XML element name
     *
     * @param {String} name Element name to check
     * @throws {gpf.Error.InvalidXmlElementName}
     */
    _gpfXmlCheckValidElementName = _gpfXmlCheckBuildSimple(_gpfXmlCheckNameRegExp, "ElementName"),

    /**
     * Check XML attribute name
     *
     * @param {String} name Attribute name to check
     * @throws {gpf.Error.InvalidXmlAttributeName}
     */
    _gpfXmlCheckValidAttributeName = _gpfXmlCheckBuildSimple(_gpfXmlCheckNameRegExp, "AttributeName"),

    /**
    * Check XML namespace prefix name
    *
    * @param {String} name Namespace prefix name to check
    * @throws {gpf.Error.InvalidXmlNamespacePrefixName}
    */
    _gpfXmlCheckValidNamespacePrefixName = _gpfXmlCheckBuildSimple(_gpfXmlNamespacePrefixRegExp, "NamespacePrefix");

function _gpfXmlCheckNoXmlns (prefix) {
    if ("xmlns" === prefix) {
        gpf.Error.invalidXmlUseOfPrefixXmlns();
    }
}

function _gpfXmlCheckQualifiedNameAndPrefix (name, prefix) {
    _gpfXmlCheckValidElementName(name);
    _gpfXmlCheckValidNamespacePrefixName(prefix);
    _gpfXmlCheckNoXmlns(prefix);
}

function _gpfXmlCheckIfKnownPrefix (prefix, knownPrefixes) {
    if (knownPrefixes.indexOf(prefix) === -1) {
        gpf.Error.unknownXmlNamespacePrefix();
    }
}

function _gpfXmlCheckQualifiedElementNameAndPrefix (name, prefix, knownPrefixes) {
    _gpfXmlCheckQualifiedNameAndPrefix(name, prefix);
    if ("xml" === prefix) {
        gpf.Error.invalidXmlUseOfPrefixXml();
    }
    _gpfXmlCheckIfKnownPrefix(prefix, knownPrefixes);
}

function _gpfXmlCheckGetQualified (noPrefixCheck, prefixCheck) {
    return function (qName, knownPrefixes) {
        var sep = qName.indexOf(":");
        if (-1 === sep) {
            noPrefixCheck(qName);
        } else {
            prefixCheck(qName.substr(0, sep), qName.substr(sep + 1), knownPrefixes);
        }
    };
}

/**
 * Check XML qualified element name
 *
 * @param {String} qName Element qualified name to check
 * @param {String[]} knownPrefixes Known namespaces prefixes
 *
 * @throws {gpf.Error.InvalidXmlElementName}
 * @throws {gpf.Error.invalidXmlNamespacePrefix}
 */
var _gpfXmlCheckQualifiedElementName = _gpfXmlCheckGetQualified(_gpfXmlCheckValidElementName,
    _gpfXmlCheckQualifiedElementNameAndPrefix);

function _gpfXmlCheckOnlyXmlSpace (name) {
    if ("space" !== name) {
        gpf.Error.invalidXmlUseOfPrefixXml();
    }
}

function _gpfXmlCheckQualifiedAttributeNameAndPrefix (name, prefix, knownPrefixes) {
    _gpfXmlCheckQualifiedNameAndPrefix(name, prefix);
    if ("xml" === prefix) {
        _gpfXmlCheckOnlyXmlSpace(name);
    }
    _gpfXmlCheckIfKnownPrefix(prefix, knownPrefixes);
}

/**
 * Check XML qualified attribute name
 *
 * @param {String} qName Attribute qualified name to check
 * @param {String[]} knownPrefixes Known namespaces prefixes
 *
 * @throws {gpf.Error.InvalidXmlElementName}
 */
var _gpfXmlCheckQualifiedAttributeName = _gpfXmlCheckGetQualified(_gpfXmlCheckValidAttributeName,
    _gpfXmlCheckQualifiedAttributeNameAndPrefix);
