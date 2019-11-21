"use strict";

describe("xml/xpath", function () {

    var Node = gpf.define({
        $class: "Node",

        _type: gpf.xml.nodeType.element,
        _name: null,
        _namespaceURI: "",
        _attributes: [],
        _children: [],
        _value: null,
        _parent: null,

        // region gpf.interfaces.IXmlNodeSyncAdapter

        getAttributes: function () {
            return this._attributes;
        },

        getChildNodes: function () {
            return this._children;
        },

        getLocalName: function () {
            return this._name;
        },

        getNamespaceURI: function () {
            return this._namespaceURI;
        },

        getNodeType: function () {
            return this._type;
        },

        getNodeValue: function () {
            return this._value;
        },

        getParentNode: function () {
            return this.parent;
        },

        // endregion

        constructor: function (name, attributes, children) {
            if (Array.isArray(attributes)) {
                children = attributes;
                attributes = undefined;
            }
            if (name) {
                this._name = name;
            }
            if (attributes) {
                this._attributes = Object.keys(attributes).map(function (attributeName) {
                    var attributeNode = new Node(attributeName);
                    attributeNode._nodeType = gpf.xml.nodeType.attribute;
                    attributeNode._value = attributes[attributeName];
                    attributeNode._parent = this;
                    return attributeNode;
                }, this);
            }
            if (children) {
                this._children = children.map(function (childNode) {
                    if (typeof childNode === "string") {
                        var textNode = new Node();
                        textNode._value = childNode;
                        childNode = textNode;
                    }
                    childNode._parent = this;
                    return childNode;
                }, this);
            }
        }
    });

    function node (name, attributes, children) {
        return new Node(name, attributes, children);
    }

    var htmlDocument = node("html", [
        node("head", [
            node("title", ["Sample page"]),
            node("script", {src: "/gpf.js"})
        ]),
        node("body", [])
    ]);

    describe("xml/xpath", function () {
        it("exposes a valid document", function () {
            debugger;
            assert(htmlDocument);
        });
    });

});
