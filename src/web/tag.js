/**
 * @file Tag generation helper
 * @since 0.2.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfIsArray*/ // Return true if the parameter is an array
/*global _gpfIsLiteralObject*/ // Check if the parameter is a literal object
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*global _gpfStringEscapeFor*/ // Make the string content compatible with lang
/*global _gpfSyncReadSourceJSON*/ // Reads a source json file (only in source mode)
/*#endif*/

/**
 * Tag instance allocated by {@link gpf.typedef.tagFunc}
 *
 * @class gpf.typedef.Tag
 *
 * @see gpf.web.createTagFunction
 * @since 0.2.1
 */

/**
 * String conversion
 *
 * @method gpf.typedef.Tag.prototype.toString
 * @return {String} HTML result
 *
 * @see gpf.web.createTagFunction
 * @since 0.2.1
 */

/**
 * DOM insertion
 *
 * @method gpf.typedef.Tag.prototype.appendTo
 * @param {Object} node DOM parent to append the node to
 * @return {Object} Created DOM Node
 *
 * @see gpf.web.createTagFunction
 * @since 0.2.1
 */

/**
 * Tag generation function child specification.  When string, a text node is created.
 *
 * @typedef gpf.typedef.tagChild
 * @property {String|gpf.typedef.Tag}
 *
 * @see gpf.web.createTagFunction
 * @since 0.2.1
 */

/**
 * Tag generation function children specification
 *
 * @typedef gpf.typedef.tagChildren
 * @property {gpf.typedef.tagChild|gpf.typedef.tagChild[]}
 *
 * @see gpf.web.createTagFunction
 * @since 0.2.1
 */

/**
 * Tag generation function, it accepts up to two parameters:
 * - When no parameter is passed, an empty node is created
 * - If the first parameter is a literal object (see {@link gpf.isLiteralObject}), its properties are used to
 *   define the node attributes
 * - Otherwise, the second (or first if not a literal object) is used to define children that will be appended to this
 *   tag
 *
 * @callback gpf.typedef.tagFunc
 *
 * @param {Object|gpf.typedef.tagChildren} [attributes=undefined] When a literal object is passed, it is interpreted
 * as an attribute dictionary. The attribute name may contain the xlink namespace prefix.
 * @param {gpf.typedef.tagChildren} [children=undefined] List of children
 * @return {gpf.typedef.Tag} Tag object
 *
 * @see gpf.web.createTagFunction
 * @since 0.2.1
 */

_gpfErrorDeclare("web/tag", {
    /**
     * ### Summary
     *
     * Missing node name
     *
     * ### Description
     *
     * A tag can't be created if the node name is missing
     * @since 0.2.1
     */
    missingNodeName: "Missing node name",

    /**
     * ### Summary
     *
     * Unknown namespace prefix
     *
     * ### Description
     *
     * A prefix has been used prior to be associated with a namespace
     * @since 0.2.2
     */
    unknownNamespacePrefix: "Unknown namespace prefix",

    /**
     * ### Summary
     *
     * Unable to use namespace in string
     *
     * ### Description
     *
     * A prefix associated to a namespace has been used and can't be converted to string
     * @since 0.2.2
     */
    unableToUseNamespaceInString: "Unable to use namespace in string"
});

/**
 * Mapping of attribute name aliases
 * @type {Object}
 * @since 0.2.1
 */
var _gpfWebTagAttributeAliases = _gpfSyncReadSourceJSON("web/attributes.json");

/**
 * Mapping of prefixes for namespaces
 * @type {Object}
 * @since 0.2.2
 */
var _gpfWebNamespacePrefix = _gpfSyncReadSourceJSON("web/namespaces.json");

/**
 * Retrieves namespace associated to the prefix or fail
 *
 * @param {String} prefix Namespace prefix
 * @return {String} Namespace URI
 * @throws {gpf.Error.UnknownNamespacePrefix}
 * @since 0.2.2
 */
function _gpfWebGetNamespace (prefix) {
    var namespace = _gpfWebNamespacePrefix[prefix];
    if (undefined === namespace) {
        gpf.Error.unknownNamespacePrefix();
    }
    return namespace;
}

/**
 * Resolves prefixed name to namespace and name
 *
 * @param {String} name Attribute or node name
 * @return {{namespace, name}|undefined} Namespace and name in a structure if prefixed, undefined otherwise
 * @since 0.2.2
 */
function _gpfWebGetNamespaceAndName (name) {
    var EXPECTED_PARTS_COUNT = 2,
        NAMESPACE_PREFIX = 0,
        NAME = 1,
        parts = name.split(":");
    if (parts.length === EXPECTED_PARTS_COUNT) {
        return {
            namespace: _gpfWebGetNamespace(parts[NAMESPACE_PREFIX]),
            name: parts[NAME]
        };
    }
}

/**
 * Fails if the name includes namespace prefix
 *
 * @param {String} name Attribute or node name
 * @throws {gpf.Error.UnableToUseNamespaceInString}
 * @since 0.2.2
 */
function _gpfWebCheckNamespaceSafe (name) {
    if (name.includes(":")) {
        gpf.Error.unableToUseNamespaceInString();
    }
}

/**
 * Resolve attribute name
 *
 * @param {String} name Attribute name used in the tag function
 * @return {String} Attribute to set on the node ele,ment
 * @since 0.2.1
 */
function _gpfWebTagAttributeAlias (name) {
    return _gpfWebTagAttributeAliases[name] || name;
}

/**
 * Apply the callback to each array item,
 * process recursively if the array item is an array
 *
 * @param {Array} array array of items
 * @param {Function} callback Function to apply on each array item
 * @since 0.2.1
 */
function _gpfWebTagFlattenChildren (array, callback) {
    array.forEach(function (item) {
        if (_gpfIsArray(item)) {
            _gpfWebTagFlattenChildren(item, callback);
        } else {
            callback(item);
        }
    });
}

var _GpfWebTag = _gpfDefine({
    $class: "gpf.web.Tag",

    /**
     * Tag object
     *
     * @param {String} nodeName Node name
     * @param {Object} [attributes] Dictionary of attributes to set
     * @param {Array} [children] Children
     *
     * @constructor gpf.web.Tag
     * @private
     * @since 0.2.1
     */
    constructor: function (nodeName, attributes, children) {
        this._nodeName = nodeName;
        this._attributes = attributes || {};
        this._children = children;
    },

    /**
     * Node name
     * @since 0.2.1
     */
    _nodeName: "",

    /**
     * Node attributes
     * @since 0.2.1
     */
    _attributes: {},

    /**
     * Node children
     * @since 0.2.1
     */
    _children: [],

    //region toString implementation

    _getAttributesAsString: function () {
        return Object.keys(this._attributes).map(function (name) {
            _gpfWebCheckNamespaceSafe(name);
            return " " + _gpfWebTagAttributeAlias(name)
                + "=\"" + _gpfStringEscapeFor(this._attributes[name], "html") + "\"";
        }, this).join("");
    },

    _getChildrenAsString: function () {
        var result = [];
        _gpfWebTagFlattenChildren(this._children, function (child) {
            result.push(child.toString());
        });
        return result.join("");
    },

    _getClosingString: function () {
        if (this._children.length) {
            return ">" + this._getChildrenAsString() + "</" + this._nodeName + ">";
        }
        return "/>";
    },

    /**
     * Convert the current tag into HTML
     *
     * @return {String} HTML representation of the tag
     * @since 0.2.1
     */
    toString: function () {
        _gpfWebCheckNamespaceSafe(this._nodeName);
        return "<" + this._nodeName + this._getAttributesAsString() + this._getClosingString();
    },

    //endregion

    //region appendTo implementation

    _createElement: function (node) {
        var ownerDocument = node.ownerDocument,
            qualified = _gpfWebGetNamespaceAndName(this._nodeName);
        if (qualified) {
            return ownerDocument.createElementNS(qualified.namespace, qualified.name);
        }
        return ownerDocument.createElement(this._nodeName);
    },

    _setAttributesTo: function (node) {
        _gpfObjectForEach(this._attributes, function (value, name) {
            var qualified = _gpfWebGetNamespaceAndName(name);
            if (qualified) {
                node.setAttributeNS(qualified.namespace, _gpfWebTagAttributeAlias(qualified.name), value);
            } else {
                node.setAttribute(_gpfWebTagAttributeAlias(name), value);
            }
        });
    },

    _appendChildrenTo: function (node) {
        var ownerDocument = node.ownerDocument;
        _gpfWebTagFlattenChildren(this._children, function (child) {
            if (child instanceof _GpfWebTag) {
                child.appendTo(node);
            } else {
                node.appendChild(ownerDocument.createTextNode(child.toString()));
            }
        });
    },

    /**
     * Appends the tag to the provided node
     *
     * @param {Object} node Expected to be a DOM node
     * @return {Object} Created node
     * @since 0.2.1
     */
    appendTo: function (node) {
        var element = this._createElement(node);
        this._setAttributesTo(element);
        this._appendChildrenTo(element);
        return node.appendChild(element);
    }

    //endregion

});

/**
 * Create a tag generation function
 *
 * @param {String} nodeName tag name.
 * May include the namespace prefix svg for [SVG elements](https://developer.mozilla.org/en-US/docs/Web/SVG)
 * @return {gpf.typedef.tagFunc} The tag generation function
 * @gpf:closure
 * @since 0.2.1
 */
function _gpfWebTagCreateFunction (nodeName) {
    if (!nodeName) {
        gpf.Error.missingNodeName();
    }
    return function (firstParam) {
        var sliceFrom,
            attributes;
        if (_gpfIsLiteralObject(firstParam)) {
            attributes = firstParam;
            sliceFrom = 1;
        } else {
            sliceFrom = 0;
        }
        return new _GpfWebTag(nodeName, attributes, [].slice.call(arguments, sliceFrom));
    };
}

/**
 * @gpf:sameas _gpfWebTagCreateFunction
 * @since 0.2.1
 *
 * @example <caption>Tree building to string</caption>
 * var div = gpf.web.createTagFunction("div"),
 *     span = gpf.web.createTagFunction("span"),
 * tree = div({className: "test1"}, "Hello ", span({className: "test2"}, "World!"));
 * // tree.toString() gives <div class="test1">Hello <span class="test2">World!</span></div>
 *
 * @example <caption>Tree building to DOM</caption>
 * var mockNode = mockDocument.createElement("any"),
 *     div = gpf.web.createTagFunction("div"),
 *     span = gpf.web.createTagFunction("span"),
 *     tree = div({className: "test"}, "Hello ", span("World!")),
 *     result = tree.appendTo(mockNode);
 *
 * @example <caption>SVG building</caption>
 * var mockNode = mockDocument.createElement("any"),
 *     svgImage = gpf.web.createTagFunction("svg:image"),
 *     tree = svgImage({x: 0, y: 0, "xlink:href": "test.png"}),
 *     result = tree.appendTo(mockNode);
 *
 */
gpf.web.createTagFunction = _gpfWebTagCreateFunction;
