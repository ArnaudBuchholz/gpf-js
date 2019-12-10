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
                this._namespaceURI = attributes[""] || "";
                delete attributes[""];
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

    var SVG_NAMESPACE = "http://www.w3.org/2000/svg";
    var documentNode = node("", [
        node("html", [
            node("head", [
                node("title", ["Sample page"]),
                node("script", {
                    src: "/gpf.js",
                    language: "javascript"
                })
            ]),
            node("body", [
                node("svg", {
                    "": SVG_NAMESPACE,
                    height: "100",
                    width: "100"
                }, [
                    node("circle", {
                        "": SVG_NAMESPACE,
                        cx: "50",
                        cy: "50",
                        r: "40",
                        stroke: "black",
                        "stroke-width": "3",
                        fill: "red"
                    })
                ])
            ])
        ])
    ]);
    documentNode._type = gpf.xml.nodeType.document;
    var htmlNode = documentNode.getChildNodes()[0],
        headNode = htmlNode.getChildNodes()[0],
        scriptNode = headNode.getChildNodes()[1],
        srcAttrNode = scriptNode.getAttributes()[0],
        languageAttrNode = scriptNode.getAttributes()[1],
        bodyNode = htmlNode.getChildNodes()[1],
        svgNode = bodyNode.getChildNodes()[0],
        circleNode = svgNode.getChildNodes()[0];

    describe("xml/xpath", function () {
        describe("validation", function () {
            function shouldFail (xpath) {
                it("does not parse: " + xpath, function () {
                    var exceptionCaught;
                    try {
                        gpf.xml.xpath.parse(xpath);
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.InvalidXPathSyntax);
                });
            }

            shouldFail("test");
            shouldFail("///test");
            shouldFail("..//test");
            shouldFail(".//test || .//test");
        });

        describe("gpf.xml.xpath.select", function () {
            function generateTests (test) {
                var xpath = test.xpath,
                    namespaces = test.namespaces,
                    label = test.xpath;
                if (namespaces) {
                    label += Object.keys(namespaces).reduce(function (result, prefix) {
                        return result + " " + prefix + "=\"" + namespaces[prefix] + "\"";
                    }, " (with") + ")";
                }
                describe(label, function () {
                    it("parses", function () {
                        var parsed = gpf.xml.xpath.parse(xpath);
                        assert(parsed.toString() === xpath);
                    });
                    if (test.onDocument) {
                        it("executes on document", function () {
                            var nodes = gpf.xml.xpath.select(xpath, documentNode, namespaces);
                            test.onDocument(nodes);
                        });
                    }
                    if (test.onHtml) {
                        it("executes on <html />", function () {
                            var nodes = gpf.xml.xpath.select(xpath, htmlNode, namespaces);
                            test.onHtml(nodes);
                        });
                    }
                    if (test.onHead) {
                        it("executes on <head />", function () {
                            var nodes = gpf.xml.xpath.select(xpath, headNode, namespaces);
                            test.onHead(nodes);
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

            [{
                xpath: "//html",
                onDocument: is(htmlNode),
                onHtml: is(htmlNode),
                onHead: is(htmlNode)
            }, {
                xpath: ".//html",
                onDocument: is(htmlNode),
                onHtml: isEmpty,
                onHead: isEmpty
            }, {
                xpath: "//html/head",
                onDocument: is(headNode),
                onHtml: is(headNode),
                onHead: is(headNode)
            }, {
                xpath: "//html/head | //html/body",
                onDocument: is([headNode, bodyNode]),
                onHtml: is([headNode, bodyNode]),
                onHead: is([headNode, bodyNode])
            }, {
                xpath: "//html/head | .//body",
                onDocument: is([headNode, bodyNode]),
                onHtml: is([headNode, bodyNode]),
                onHead: is(headNode)
            }, {
                xpath: "/html/head/script/@src",
                onDocument: is(srcAttrNode),
                onHtml: is(srcAttrNode),
                onHead: is(srcAttrNode)
            }, {
                xpath: "/html/head/script/@*",
                onDocument: is([srcAttrNode, languageAttrNode]),
                onHtml: is([srcAttrNode, languageAttrNode]),
                onHead: is([srcAttrNode, languageAttrNode])
            }, {
                xpath: "//html/head | ./script/@src",
                onDocument: is(headNode),
                onHtml: is(headNode),
                onHead: is([headNode, srcAttrNode])
            }, {
                xpath: "//svg:svg",
                namespaces: {
                    svg: SVG_NAMESPACE
                },
                onDocument: is(svgNode),
                onHtml: is(svgNode),
                onHead: is(svgNode)
            }, {
                xpath: ".//svg:*",
                namespaces: {
                    svg: SVG_NAMESPACE
                },
                onDocument: is([svgNode, circleNode]),
                onHtml: is([svgNode, circleNode]),
                onHead: isEmpty
            }, {
                xpath: "//svg:*",
                namespaces: {
                    notSvg: SVG_NAMESPACE
                },
                onDocument: isEmpty,
                onHtml: isEmpty,
                onHead: isEmpty
            }, {
                xpath: "//unknown:*",
                namespaces: {
                    unknown: "not a known namespace"
                },
                onDocument: isEmpty,
                onHtml: isEmpty,
                onHead: isEmpty
            }, {
                xpath: "/html/head//*[@*]",
                onDocument: is(scriptNode),
                onHtml: is(scriptNode),
                onHead: is(scriptNode)
            }].forEach(generateTests);
        });
    });
});
