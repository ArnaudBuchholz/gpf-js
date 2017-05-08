/**
 * @file Tag generation helper
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfIsArray*/ // Return true if the paramater is an array
/*global _gpfIsLiteralObject*/ // Check if the parameter is a literal object
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*global _gpfStringEscapeFor*/ // Make the string content compatible with lang
/*#endif*/

_gpfErrorDeclare("web/tag", {
    /**
     * ### Summary
     *
     * Missing node name
     *
     * ### Description
     *
     * A tag can't be created if the node name is missing
     */
    missingNodeName: "Missing node name"

});

/**
 * Mapping of attribute name aliases
 * @type {Object}
 */
var _gpfWebTagAttributeAliases = {
    "className": "class"
};

/**
 * Resolve attribute name
 *
 * @param {String} name Attribute name used in the tag function
 * @return {String} Attribute to set on the node ele,ment
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
     * @constructor gpf.web.Ta
     * @private
     */
    constructor: function (nodeName, attributes, children) {
        this._nodeName = nodeName;
        this._setAttributes(attributes);
        this._setChildren(children);
    },

    /** Node name */
    _nodeName: "",

    /** Node attributes */
    _attributes: {},

    /** @gpf:write _attributes */
    _setAttributes: function (attributes) {
        this._attributes = attributes || {};
    },

    /** Node children */
    _children: [],

    /** @gpf:write _children */
    _setChildren: function (children) {
        this._children = children || [];
    },

    //region toString implementation

    _getAttributesAsString: function () {
        return Object.keys(this._attributes).map(function (name) {
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
     */
    toString: function () {
        return "<" + this._nodeName + this._getAttributesAsString() + this._getClosingString();
    },

    //endregion

    //region appendTo implementation

    _setAttributesTo: function (node) {
        _gpfObjectForEach(this._attributes, function (value, name) {
            node.setAttribute(_gpfWebTagAttributeAlias(name), value);
        });
    },

    _appendChildrenTo: function (node, ownerDocument) {
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
     */
    appendTo: function (node) {
        var ownerDocument = node.ownerDocument,
            element = ownerDocument.createElement(this._nodeName);
        this._setAttributesTo(element);
        this._appendChildrenTo(element, ownerDocument);
        return node.appendChild(element);
    }

    //endregion

});

/**
 * Create a function that can be used to generate HTML
 *
 * @param {String} [nodeName] tag name
 * @return {Function} The tag generation function
 * @gpf:closure
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
 */
gpf.web.createTagFunction = _gpfWebTagCreateFunction;
