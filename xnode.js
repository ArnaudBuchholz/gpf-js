(function(){ /* Begin of privacy scope */
    "use strict";

    var
        // gpfA = gpf.attributes,
        gpfI = gpf.interfaces;

    gpf.extend(gpf.xml, {
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

    gpfI.IXmlConstNode = gpfI.Interface.extend({

        /**
         * Access to the attributes of this node: attributes() returns a map
         * with attributes and their values, attributes(name) returns the
         * selected attribute value
         *
         * @param {string} name When specified, name of the attribute to get or
         *        set
         * @return {object|string}
         */
        attributes: function (name) {
            gpf.interfaces.ignoreParameter(name);
            return "";
        },

        /**
         * Returns the array of child nodes for the node
         *
         * @returns {gpf.interfaces.IXmlConstNode[]}
         */
        children: function () {
            return [];
        },

        /**
         * Returns the local part of the name of a node
         *
         * @returns {string}
         */
        localName: function () {
            return "";
        },

        /**
         * Returns the namespace URI of a node
         *
         * @returns {string}
         */
        namespaceURI: function () {
            return "";
        },

        /**
         * Returns the node immediately following a node
         *
         * @returns {gpf.interfaces.IXmlConstNode}
         */
        nextSibling: function () {
            return null;
        },

        /**
         * Returns the name of a node, depending on its type
         *
         * @returns {string}
         */
        nodeName: function () {
            return "";
        },

        /**
         * Returns the type of a node
         *
         * @returns {number}
         */
        nodeType: function () {
            return 0;
        },

        /**
         * Returns the value of a node, depending on its type
         *
         * @returns {string}
         */
        nodeValue: function () {
            return "";
        },

        /**
         * Returns the root element (document object) for a node
         *
         * @returns {gpf.interfaces.IXmlConstNode}
         */
        ownerDocument: function () {
            return null;
        },

        /**
         * Returns the parent node of a node
         *
         * @returns {gpf.interfaces.IXmlConstNode}
         */
        parentNode: function () {
            return null;
        },

        /**
         * Sets or returns the namespace prefix of a node
         *
         * @returns {string}
         */
        prefix: function () {
            return "";
        },

        /**
         * Returns the node immediately before a node
         *
         * @returns {gpf.interfaces.IXmlConstNode}
         */
        previousSibling: function () {
            return null;
        },

        /**
         * Sets or returns the textual content of a node and its descendants
         *
         * @returns {string}
         */
        textContent: function () {
            return "";
        }

    });

    /**
     */
    gpf.xml.ConstNode = gpf.Class.extend({

        "[Class]": [gpf.$InterfaceImplement(gpfI.IXmlConstNode)],

        _obj: null,
        _name: "",
        _parentNode: null,
        _attributes: [],
        _elements: [],
        _children: [],

        init: function (obj, name) {
            this._obj = obj;
            this._attributes = null;
            this._elements = null;
            if (undefined === name) {
                this._name = "root";
            }
        },

        _members: function () {
            var member, value;
            this._attributes = [];
            this._elements = [];
            for (member in this._obj) {
                if (this._obj.hasOwnProperty(member)) {
                    value = this._obj[member];
                    if (null === value) {
                        // Ignore
                        continue;
                    }
                    if ("object" === typeof value) {
                        this._elements.push(member);
                    } else {
                        this._attributes.push(member);
                    }
                }
            }
        },

        //region gpf.interfaces.IXmlConstNode

        /**
         * @implements gpf.interfaces.IXmlConstNode:attributes
         */
        attributes: function (name) {
            var idx, result;
            if (null === this._attributes) {
                this._members();
            }
            if (undefined === name) {
                result = {};
                for (idx = 0; idx < this._attributes.length; ++idx) {
                    name = this._attributes[idx];
                    result[name] = this._obj[name];
                }
                return result;
            }
            if (undefined !== gpf.test(this._attributes, name)) {
                return this._obj[name];
            }
            return undefined;
        },

        /**
         * @implements gpf.interfaces.IXmlConstNode:children
         */
        children: function () {
            var idx, name, child;
            if (null === this._elements) {
                this._members();
                this._children = [];
                for (idx = 0; idx < this._elements.length; ++idx) {
                    name = this._elements[idx];
                    child = new gpf.xml.ConstNode(this._obj[name], name);
                    child._parentNode = this;
                    this._children.push(child);
                }
            }
            return this._children;
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
            if (null !== this._parentObj) {
                pos = gpf.test(this._parentObj._elements, this._name);
                if (0 < pos) {
                    return this._parentObj._children[pos - 1];
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
            return "";
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
            if (null !== this._parentObj) {
                pos = gpf.test(this._parentObj._elements, this._name);
                if (pos < this._parentObj._elements.length - 1) {
                    return this._parentObj._children[pos + 1];
                }
            }
            return null;
        },

        /**
         * @implements gpf.interfaces.IXmlConstNode:textContent
         */
        textContent: function () {
            return "";
        }

        //endregion
    });

}()); /* End of privacy scope */
