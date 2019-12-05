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
            return this._parent;
        },

        // endregion

        _build: function (name, attributes, children) {
            if (name) {
                this._name = name;
            }
            if (attributes) {
                this._attributes = Object.keys(attributes).map(function (attributeName) {
                    var attributeNode = new Node(attributeName);
                    attributeNode._type = gpf.xml.nodeType.attribute;
                    attributeNode._value = attributes[attributeName];
                    attributeNode._parent = this;
                    return attributeNode;
                }, this);
            }
            if (children) {
                this._children = children.map(function (childNode) {
                    var mappedNode;
                    if (typeof childNode === "string") {
                        mappedNode = new Node();
                        mappedNode._value = childNode;
                        mappedNode._type = gpf.xml.nodeType.text;
                    } else {
                        mappedNode = childNode;
                    }
                    mappedNode._parent = this;
                    return mappedNode;
                }, this);
            }
        },

        constructor: function (name, attributes, children) {
            if (Array.isArray(attributes)) {
                this._build(name, undefined, attributes);
            } else {
                this._build(name, attributes, children);
            }
        }
    });

    function node (name, attributes, children) {
        return new Node(name, attributes, children);
    }

    var documentNode = node("", [
        node("html", [
            node("head", [
                node("title", ["Sample page"]),
                node("script", {src: "/gpf.js"})
            ]),
            node("body", [

            ])
        ])
    ]);
    documentNode._type = gpf.xml.nodeType.document;
    var htmlNode = documentNode.getChildNodes()[0],
        headNode = htmlNode.getChildNodes()[0],
        scriptNode = headNode.getChildNodes()[1],
        srcAttrNode = scriptNode.getAttributes()[0],
        bodyNode = htmlNode.getChildNodes()[1];

    describe("xml/xpath", function () {
        describe("gpf.xml.xpath.select", function () {

            function generateTests (xpath, checks) {
                describe(xpath, function () {
                    if (checks.xpath) {
                        it("parses", function () {
                            var parsed = gpf.xml.xpath.parse(xpath);
                            assert(parsed.toString() === xpath);
                            checks.xpath(parsed);
                        });
                    }
                    if (checks.document) {
                        it("executes on document", function () {
                            var nodes = gpf.xml.xpath.select(xpath, documentNode);
                            checks.document(nodes);
                        });
                    }
                    if (checks.html) {
                        it("executes on <html />", function () {
                            var nodes = gpf.xml.xpath.select(xpath, htmlNode);
                            checks.html(nodes);
                        });
                    }
                    if (checks.head) {
                        it("executes on <head />", function () {
                            var nodes = gpf.xml.xpath.select(xpath, headNode);
                            checks.head(nodes);
                        });
                    }
                });
            }

            function isEmpty (nodes) {
                assert(nodes.length === 0);
            }

            function is (nodeOrNodes) {
                var expectedNodes;
                if (Array.isArray(nodeOrNodes)) {
                    expectedNodes = nodeOrNodes;
                } else {
                    expectedNodes = [nodeOrNodes];
                }
                return function (nodes) {
                    assert(nodes.length === expectedNodes.length);
                    // Order is not significant
                    assert(expectedNodes.every(function (expectedNode) {
                        return nodes.includes(expectedNode);
                    }));
                };
            }

            generateTests("//html", {
                xpath: function (parsed) {
                    assert(parsed instanceof gpf.xml.xpath.Deep);
                    assert(parsed.getChildren()[0] instanceof gpf.xml.xpath.Match);
                },
                document: is(htmlNode),
                html: is(htmlNode),
                head: is(htmlNode)
            });

            generateTests(".//html", {
                xpath: function (parsed) {
                    assert(parsed instanceof gpf.xml.xpath.Deep);
                    assert(parsed.getChildren()[0] instanceof gpf.xml.xpath.Match);
                },
                document: is(htmlNode),
                html: isEmpty,
                head: isEmpty
            });

            generateTests("//html/head", {
                xpath: function (parsed) {
                    assert(parsed instanceof gpf.xml.xpath.Chain);
                    assert(parsed.getChildren()[0] instanceof gpf.xml.xpath.Deep);
                    assert(parsed.getChildren()[1] instanceof gpf.xml.xpath.Sub);
                },
                document: is(headNode),
                html: is(headNode),
                head: is(headNode)
            });

            generateTests("//html/head | //html/body", {
                xpath: function (parsed) {
                    assert(parsed instanceof gpf.xml.xpath.Concat);
                    assert(parsed.getChildren()[0] instanceof gpf.xml.xpath.Chain);
                    assert(parsed.getChildren()[1] instanceof gpf.xml.xpath.Chain);
                },
                document: is([headNode, bodyNode]),
                html: is([headNode, bodyNode]),
                head: is([headNode, bodyNode])
            });

            generateTests("//html/head | .//body", {
                xpath: function (parsed) {
                    assert(parsed instanceof gpf.xml.xpath.Concat);
                    assert(parsed.getChildren()[0] instanceof gpf.xml.xpath.Chain);
                    assert(parsed.getChildren()[1] instanceof gpf.xml.xpath.Deep);
                },
                document: is([headNode, bodyNode]),
                html: is([headNode, bodyNode]),
                head: is(headNode)
            });

            generateTests("/html/head/script/@src", {
                xpath: function (parsed) {
                    assert(parsed instanceof gpf.xml.xpath.Chain);
                    assert(parsed.getChildren().length === 4);
                    assert(parsed.getChildren()[0] instanceof gpf.xml.xpath.Sub);
                },
                document: is(srcAttrNode),
                html: is(srcAttrNode),
                head: is(srcAttrNode)
            });
        });
    });
});
