/**
 * @file Tag generation helper
 * @since 0.2.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
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
     * @since 0.2.1
     */
    missingNodeName: "Missing node name"

});

function _gpfWebTagAttributeAlias (name) {
    if ("className" === name) {
        return "class";
    }
    return name;
}

function _gpfWebTagFlattenChildren (array, callback) {
    array.forEach(function (item) {
        if (Array.isArray(item)) {
            _gpfWebTagFlattenChildren(item, callback);
        } else {
            callback(item);
        }
    });
}

var _GpfWebTag = _gpfDefine({
    $class: "gpf.web.Tag",

    constructor: function (nodeName, attributes, children) {
        this._nodeName = nodeName;
        this._setAttributes(attributes);
        this._setChildren(children);
    },

    _nodeName: "",

    _setAttributes: function (attributes) {
        this._attributes = attributes || {};
    },

    _attributes: {},

    _setChildren: function (children) {
        this._children = children || [];
    },

    _children: [],

    toString: function () {
        var result = ["<", this._nodeName];
        _gpfObjectForEach(this._attributes, function (value, name) {
            result.push(" ", _gpfWebTagAttributeAlias(name), "=\"", _gpfStringEscapeFor(value, "html"), "\"");
        });
        if (this._children.length) {
            result.push(">");
            _gpfWebTagFlattenChildren(this._children, function (child) {
                result.push(child.toString());
            });
            result.push("</", this._nodeName, ">");
        } else {
            result.push("/>");
        }
        return result.join("");
    },

    appendTo: function (node) {
        var ownerDocument = node.ownerDocument,
            element = ownerDocument.createElement(this._nodeName);
        _gpfObjectForEach(this._attributes, function (value, name) {
            element.setAttribute(_gpfWebTagAttributeAlias(name), value);
        });
        _gpfWebTagFlattenChildren(this._children, function (child) {
            if ("string" === typeof child) {
                element.appendChild(ownerDocument.createTextNode(child));
            } else {
                child.appendTo(element);
            }
        });
        return node.appendChild(element);
    }

});

function _gpfWebTagIsAttributes (firstParameter) {
    return !(firstParameter instanceof _GpfWebTag)
            && "string" !== typeof firstParameter
            && !Array.isArray(firstParameter);
}

/**
 * Create a function that can be used to generate HTML
 *
 * @param {String} [nodeName] tag name
 * @return {Function} The tag generation function
 * @gpf:closure
 * @since 0.2.1
 */
function _gpfWebTagCreateFunction (nodeName) {
    if (!nodeName) {
        gpf.Error.missingNodeName();
    }
    return function (attributes) {
        if (_gpfWebTagIsAttributes(attributes)) {
            return new _GpfWebTag(nodeName, attributes, [].slice.call(arguments, 1));
        }
        return new _GpfWebTag(nodeName, undefined, [].slice.call(arguments, 0));
    };
}

/**
 * @gpf:sameas _gpfWebTagCreateFunction
 * @since 0.2.1
 */
gpf.web.createTagFunction = _gpfWebTagCreateFunction;
