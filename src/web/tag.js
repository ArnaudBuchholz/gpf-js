/**
 * @file Tag generation helper
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
        if (!nodeName) {
            gpf.Error.missingNodeName();
        }
        this._nodeName = nodeName;
        if (attributes) {
            this._attributes = attributes;
        }
        if (children) {
            this._children = children;
        }
    },

    _nodeName: "",
    _attributes: {},
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

function _gpfWebTag (attributes) {
    /*jshint validthis:true*/
    var me = this; //eslint-disable-line no-invalid-this
    if (_gpfWebTagIsAttributes(attributes)) {
        return new _GpfWebTag(me.nodeName, attributes, [].slice.call(arguments, 1));
    }
    return new _GpfWebTag(me.nodeName, undefined, [].slice.call(arguments, 0));
}

/**
 * Create a function that can be used to generate HTML
 *
 * @param {String} [tagName] tag name
 * @return {Function} The tag generation function
 * @gpf:closure
 */
function _gpfWebTagCreateFunction (tagName) {
    if (!tagName) {
        gpf.Error.missingNodeName();
    }
    return _gpfWebTag.bind({
        nodeName: tagName
    });
}

/** @gpf:sameas _gpfWebTagCreateFunction */
gpf.web.createTagFunction = _gpfWebTagCreateFunction;
