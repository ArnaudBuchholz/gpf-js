/**
 * @file XML validation helpers
 * @since 0.2.7
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_NOT_FOUND*/ // -1
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*exported _gpfXmlCheckDefinableNamespacePrefixName*/ // Check if the given XML namespace prefix name can be defined
/*exported _gpfXmlCheckQualifiedAttributeName*/ // Check XML qualified attribute name
/*exported _gpfXmlCheckQualifiedElementName*/ // Check XML qualified element name
/*exported _gpfXmlCheckValidAttributeName*/ // Check XML attribute name
/*exported _gpfXmlCheckValidElementName*/ // Check XML element name
/*exported _gpfXmlCheckValidNamespacePrefixName*/ // Check XML namespace prefix name
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
    * @since 0.2.7
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
    * @since 0.2.7
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
    * @since 0.2.7
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
    * @since 0.2.7
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
    * @since 0.2.7
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
    * @since 0.2.7
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
     * @since 0.2.7
     */
    _gpfXmlCheckValidElementName = _gpfXmlCheckBuildSimple(_gpfXmlCheckNameRegExp, "ElementName"),

    /**
     * Check XML attribute name
     *
     * @param {String} name Attribute name to check
     * @throws {gpf.Error.InvalidXmlAttributeName}
     * @since 0.2.7
     */
    _gpfXmlCheckValidAttributeName = _gpfXmlCheckBuildSimple(_gpfXmlCheckNameRegExp, "AttributeName"),

    /**
    * Check XML namespace prefix name
    *
    * @param {String} name Namespace prefix name to check
    * @throws {gpf.Error.InvalidXmlNamespacePrefix}
    * @since 0.2.7
    */
    _gpfXmlCheckValidNamespacePrefixName = _gpfXmlCheckBuildSimple(_gpfXmlNamespacePrefixRegExp, "NamespacePrefix");

function _gpfXmlCheckNoXmlns (prefix) {
    if (prefix === "xmlns") {
        gpf.Error.invalidXmlUseOfPrefixXmlns();
    }
}

function _gpfXmlCheckQualifiedNameAndPrefix (name, prefix) {
    _gpfXmlCheckValidElementName(name);
    _gpfXmlCheckValidNamespacePrefixName(prefix);
    _gpfXmlCheckNoXmlns(prefix);
}

function _gpfXmlCheckIfKnownPrefix (prefix, knownPrefixes) {
    if (!knownPrefixes.includes(prefix)) {
        gpf.Error.unknownXmlNamespacePrefix();
    }
}

function _gpfXmlCheckQualifiedElementNameAndPrefix (name, prefix, knownPrefixes) {
    _gpfXmlCheckQualifiedNameAndPrefix(name, prefix);
    if (prefix === "xml") {
        gpf.Error.invalidXmlUseOfPrefixXml();
    } else {
        _gpfXmlCheckIfKnownPrefix(prefix, knownPrefixes);
    }
}

function _gpfXmlCheckGetQualified (noPrefixCheck, nameAndPrefixCheck) {
    return function (qName, knownPrefixes) {
        var sep = qName.indexOf(":");
        if (sep === _GPF_NOT_FOUND) {
            noPrefixCheck(qName);
        } else {
            nameAndPrefixCheck(qName.substr(sep + 1), qName.substr(0, sep), knownPrefixes);
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
 * @since 0.2.7
 */
var _gpfXmlCheckQualifiedElementName = _gpfXmlCheckGetQualified(_gpfXmlCheckValidElementName,
    _gpfXmlCheckQualifiedElementNameAndPrefix);

function _gpfXmlCheckOnlyXmlSpace (name) {
    if (name !== "space") {
        gpf.Error.invalidXmlUseOfPrefixXml();
    }
}

function _gpfXmlCheckQualifiedAttributeNameAndPrefix (name, prefix, knownPrefixes) {
    _gpfXmlCheckQualifiedNameAndPrefix(name, prefix);
    if (prefix === "xml") {
        _gpfXmlCheckOnlyXmlSpace(name);
    } else {
        _gpfXmlCheckIfKnownPrefix(prefix, knownPrefixes);
    }
}

/**
 * Check XML qualified attribute name
 *
 * @param {String} qName Attribute qualified name to check
 * @param {String[]} knownPrefixes Known namespaces prefixes
 *
 * @throws {gpf.Error.InvalidXmlElementName}
 * @since 0.2.7
 */
var _gpfXmlCheckQualifiedAttributeName = _gpfXmlCheckGetQualified(_gpfXmlCheckValidAttributeName,
    _gpfXmlCheckQualifiedAttributeNameAndPrefix);


/**
 * Check if the given XML namespace prefix name can be defined
 *
 * @param {String} name Namespace prefix name to check
 * @throws {gpf.Error.InvalidXmlNamespacePrefix}
 * @throws {gpf.Error.InvalidXmlUseOfPrefixXmlns}
 * @throws {gpf.Error.InvalidXmlUseOfPrefixXml}
 * @since 0.2.7
 */
function _gpfXmlCheckDefinableNamespacePrefixName (name) {
    _gpfXmlCheckValidNamespacePrefixName(name);
    _gpfXmlCheckNoXmlns(name);
    if (name === "xml") {
        gpf.Error.invalidXmlUseOfPrefixXml();
    }
}
