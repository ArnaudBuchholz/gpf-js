/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
"use strict";
/*global _gpfExtend*/ // gpf.extend
/*#endif*/

    var
        // gpfA = gpf.attributes,
        gpfI = gpf.interfaces;

    _gpfExtend(gpf.xml, {
        NODE_INVALID:                   0,
        NODE_ELEMENT:                   1,
        NODE_ATTRIBUTE:                 2,
        NODE_TEXT:                      3,
//        NODE_CDATA_SECTION:             4,
        NODE_ENTITY_REFERENCE:          5,
//        NODE_ENTITY:                    6,
        NODE_PROCESSING_INSTRUCTION:    7,
        NODE_COMMENT:                   8,
        NODE_DOCUMENT:                  9
//        NODE_DOCUMENT_TYPE:             10,
//        NODE_DOCUMENT_FRAGMENT:         11,
//        NODE_NOTATION:                  12
    });

    /**
     * Defines an XML node structure (Read Only)
     *
     * @class gpf.interfaces.IXmlConstNode
     * @extends gpf.interfaces.Interface
     */
    gpf._defIntrf("IXmlConstNode", {

        /**
         * Access to the attributes of this node: attributes() returns a map
         * with attributes and their values, attributes(name) returns the
         * selected attribute value
         *
         * @param {String} name When specified, name of the attribute to get or
         *        set
         * @return {Object|string}
         */
        attributes: function (name) {
            gpf.interfaces.ignoreParameter(name);
            return "";
        },

        /**
         * Returns the array of child nodes for the node
         *
         * @param {Number} [idx=undefined] idx (see gpf.arrayOrItem)
         * @return {gpf.interfaces.IXmlConstNode
         *           |gpf.interfaces.IXmlConstNode[]
         *           |undefined}
         */
        children: function (idx) {
            if (undefined === idx) {
                return [];
            } else {
                return undefined;
            }
        },

        /**
         * Returns the local part of the name of a node
         *
         * @return {String}
         */
        localName: function () {
            return "";
        },

        /**
         * Returns the namespace URI of a node
         *
         * @return {String}
         */
        namespaceURI: function () {
            return "";
        },

        /**
         * Returns the node immediately following a node
         *
         * @return {gpf.interfaces.IXmlConstNode}
         */
        nextSibling: function () {
            return null;
        },

        /**
         * Returns the name of a node, depending on its type
         *
         * @return {String}
         */
        nodeName: function () {
            return "";
        },

        /**
         * Returns the type of a node
         *
         * @return {Number}
         */
        nodeType: function () {
            return 0;
        },

        /**
         * Returns the value of a node, depending on its type
         *
         * @return {*}
         */
        nodeValue: function () {
            return null;
        },

        /**
         * Returns the root element (document object) for a node
         *
         * @return {gpf.interfaces.IXmlConstNode}
         */
        ownerDocument: function () {
            return null;
        },

        /**
         * Returns the parent node of a node
         *
         * @return {gpf.interfaces.IXmlConstNode}
         */
        parentNode: function () {
            return null;
        },

        /**
         * Sets or returns the namespace prefix of a node
         *
         * @return {String}
         */
        prefix: function () {
            return "";
        },

        /**
         * Returns the node immediately before a node
         *
         * @return {gpf.interfaces.IXmlConstNode}
         */
        previousSibling: function () {
            return null;
        },

        /**
         * Sets or returns the textual content of a node and its descendants
         *
         * @return {String}
         */
        textContent: function () {
            return "";
        }

    });

    /**
     * Manipulate a JavaScript object as an XML node
     *
     * @class gpf.xml.ConstNode
     * @implements gpf.interfaces.IXmlConstNode
     * @implements gpf.interfaces.IXmlSerializable
     */
    gpf.define("gpf.xml.ConstNode", {

        "[Class]": [gpf.$InterfaceImplement(gpfI.IXmlConstNode),
                    gpf.$InterfaceImplement(gpfI.IXmlSerializable)],

        _obj: null,
        _name: "",
        _parentNode: null,
        _attributes: {},
        _elements: {},
        _children: [],

        constructor: function (obj, name) {
            this._obj = obj;
            this._attributes = null;
            this._elements = null;
            this._children = null;
            if (undefined === name) {
                this._name = "root";
            } else {
                this._name = name;
            }
        },

        _members: function () {
            var
                member,
                value,
                name;
            this._attributes = {};
            this._elements = {};
            if ("object" === typeof this._obj
                && !(this._obj instanceof Array)) {
                for (member in this._obj) {
                    if (this._obj.hasOwnProperty(member)) {
                        value = this._obj[member];
                        if (null === value) {
                            // Ignore
                            continue;
                        }
                        name = gpf.xml.toValidName(member);
                        if ("object" === typeof value) {
                            this._elements[member] = name;
                        } else {
                            this._attributes[member] = name;
                        }
                    }
                }
            }
        },

        //region gpf.interfaces.IXmlConstNode

        /**
         * @implements gpf.interfaces.IXmlConstNode:attributes
         */
        attributes: function (name) {
            var result, member, mappedName;
            if (null === this._attributes) {
                this._members();
            }
            if (undefined === name) {
                result = {};
                for (member in this._attributes) {
                    if (this._attributes.hasOwnProperty(member)) {
                        mappedName = this._attributes[member];
                        result[mappedName] = this._obj[member];
                    }
                }
                return result;
            }
            for (member in this._attributes) {
                if (this._attributes.hasOwnProperty(member)) {
                    if (name === this._attributes[member]) {
                        return this._obj[member];
                    }
                }
            }
            return undefined;
        },

        /**
         * @implements gpf.interfaces.IXmlConstNode:children
         */
        children: function (idx) {
            var jdx, child, member, name;
            if (null === this._children) {
                if (null === this._elements) {
                    this._members();
                }
                this._children = [];
                if (this._obj instanceof Array) {
                    for (jdx = 0; jdx < this._obj.length; ++jdx) {
                        child = new gpf.xml.ConstNode(this._obj[jdx], "item");
                        child._parentNode = this;
                        this._children.push(child);
                    }
                } else {
                    for (member in this._elements) {
                        if (this._elements.hasOwnProperty(member)) {
                            name = this._elements[member];
                            child = new gpf.xml.ConstNode(this._obj[member],
                                name);
                            child._parentNode = this;
                            this._children.push(child);
                        }
                    }
                }
            }
            return gpf.arrayOrItem(this._children, idx);
        },

        /**
         * @implements gpf.interfaces.IXmlConstNode:localName
         */
        localName: function () {
            return this._name;
        },

        /**
         * @implements gpf.interfaces.IXmlConstNode:namespaceURI
         */
        namespaceURI: function () {
            return "";
        },

        /**
         * @implements gpf.interfaces.IXmlConstNode:nextSibling
         */
        nextSibling: function () {
            var pos;
            if (null !== this._parentNode) {
                pos = gpf.test(this._parentNode._children, this);
                if (undefined !== pos
                    && pos < this._parentNode._children.length - 1) {
                    return this._parentNode._children[pos + 1];
                }
            }
            return null;
        },

        /**
         * @implements gpf.interfaces.IXmlConstNode:nodeName
         */
        nodeName: function () {
            return this._name;
        },

        /**
         * @implements gpf.interfaces.IXmlConstNode:nodeType
         */
        nodeType: function () {
            return gpf.xml.NODE_ELEMENT;
        },

        /**
         * @implements gpf.interfaces.IXmlConstNode:nodeValue
         */
        nodeValue: function () {
            return this._obj;
        },

        /**
         * @implements gpf.interfaces.IXmlConstNode:ownerDocument
         */
        ownerDocument: function () {
            return null;
        },

        /**
         * @implements gpf.interfaces.IXmlConstNode:parentNode
         */
        parentNode: function () {
            return this._parentNode;
        },

        /**
         * @implements gpf.interfaces.IXmlConstNode:prefix
         */
        prefix: function () {
            return "";
        },

        /**
         * @implements gpf.interfaces.IXmlConstNode:previousSibling
         */
        previousSibling: function () {
            var pos;
            if (null !== this._parentNode) {
                pos = gpf.test(this._parentNode._children, this);
                if (0 < pos) {
                    return this._parentNode._children[pos - 1];
                }
            }
            return null;
        },

        /**
         * @implements gpf.interfaces.IXmlConstNode:textContent
         */
        textContent: function () {
            if ("object" !== typeof this._obj) {
                return gpf.value(this._obj, "");
            } else {
                return "";
            }
        },

        //endregion

        //region gpf.interfaces.IXmlSerializable

        /**
         * @implements gpf.interfaces.IXmlSerializable:toXml
         */
        toXml: function (out, eventsHandler) {
            gpf.xml.nodeToXml(this, out, eventsHandler);
        }

        //endregion

    });

    /**
     * Serialize the node into an gpf.interfaces.IXmlContentHandler
     *
     * @param {gpf.interfaces.IXmlConstNode} node Node to serialize
     * @param {gpf.interfaces.wrap(IXmlContentHandler)} wrapped XML Content
     */
    function _nodeToXml(node, wrapped) {
        var
            name = node.localName(),
            attributes = node.attributes(),
            children = node.children(),
            text = node.textContent(),
            idx;
        wrapped.startElement("", name, name, attributes);
        // Today the XmlConstNode may not have both children and textual content
        if (text) {
            wrapped.characters(text);
        } else {
            for (idx = 0; idx < children.length; ++idx) {
                _nodeToXml(children[idx], wrapped);
            }
        }
        wrapped.endElement();
    }

    /**
     * Serialize the node into an gpf.interfaces.IXmlContentHandler
     *
     * @param {gpf.interfaces.IXmlConstNode} node Node to serialize
     * @param {gpf.interfaces.IXmlContentHandler} out XML Content handler
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event ready
     */
    gpf.xml.nodeToXml = function (node, out, eventsHandler) {
        var
            WXmlContentHandler =
                gpf.interfaces.wrap(gpfI.IXmlContentHandler),
            wrapped = new WXmlContentHandler(out);
        wrapped
            .$catch(eventsHandler)
            .$finally(eventsHandler, "ready");
        _nodeToXml(node, wrapped);
    };

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/
