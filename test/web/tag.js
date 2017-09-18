"use strict";

describe("web/tag", function () {

    function Attribute (namespace, name, value) {
        this._namespace = namespace;
        this._name = name;
        this._value = value;
    }

    Attribute.prototype = {
        _namespace: "",
        _name: "",
        _value: undefined
    };

    function Node (ownerDocument, namespace, name) {
        this.ownerDocument = ownerDocument;
        this._namespace = namespace;
        this.nodeName = name;
        this._attributes = [];
        this._children = [];
    }

    Node.prototype = {
        ownerDocument: null,
        _namespace: "",
        nodeName: "",
        _attributes: [],
        _children: [],
        appendChild: function (child) {
            this._children.push(child);
            return child;
        },
        setAttribute: function (name, value) {
            this._attributes.push(new Attribute("", name, value));
        },
        setAttributeNS: function (namespace, name, value) {
            this._attributes.push(new Attribute(namespace, name, value));
        },
        _hasAttribute: function (namespace, name) {
            var result;
            this._attributes.every(function (attribute) {
                if (attribute._namespace === namespace && attribute._name === name) {
                    result = attribute._value;
                    return false;
                }
                return true;
            });
            return result;
        }
    };

    var mockDocument = {
        createElement: function (nodeName) {
            return new Node(this, "", nodeName);
        },
        createElementNS: function (namespace, nodeName) {
            return new Node(this, namespace, nodeName);
        },
        createTextNode: function (text) {
            return text;
        }
    };

    describe("gpf.web.createTagFunction", function () {

        it("requires node name when calling the function", function () {
            var exceptionCaught;
            try {
                gpf.web.createTagFunction();
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.MissingNodeName);
        });

        it("creates shortcut for tag generation", function () {
            var div = gpf.web.createTagFunction("div");
            assert(div("Hello World!").toString() === "<div>Hello World!</div>");
        });

        it("generates closed tags when empty", function () {
            var div = gpf.web.createTagFunction("div");
            assert(div().toString() === "<div/>");
        });

        it("supports tree building (parameters)", function () {
            var div = gpf.web.createTagFunction("div"),
                span = gpf.web.createTagFunction("span"),
                tree = div({className: "test1"}, "Hello ", span({className: "test2"}, "World!"));
            assert(tree.toString() === "<div class=\"test1\">Hello <span class=\"test2\">World!</span></div>");
        });

        it("supports tree building (array parameter)", function () {
            var div = gpf.web.createTagFunction("div"),
                span = gpf.web.createTagFunction("span"),
                tree = div({width: "80%"}, "Hello ", [span("Wor"), span("ld!")]);
            assert(tree.toString() === "<div width=\"80%\">Hello <span>Wor</span><span>ld!</span></div>");
        });

        it("allows DOM injection", function () {
            var mockNode = mockDocument.createElement("any"),
                div = gpf.web.createTagFunction("div"),
                span = gpf.web.createTagFunction("span"),
                tree = div({className: "test"}, "Hello ", span("World!")),
                result = tree.appendTo(mockNode);
            assert(result instanceof Node);
            assert(result.ownerDocument === mockDocument);
            assert(result.nodeName === "div");
            assert(result._hasAttribute("", "class") === "test");
            assert(result._children.length === 2);
            assert(result._children[0] === "Hello ");
            assert(result._children[1] instanceof Node);
            assert(result._children[1]._children[0] === "World!");
        });

        it("permits namespaces", function () {
            var mockNode = mockDocument.createElement("any"),
                svgImage = gpf.web.createTagFunction("svg:image"),
                tree = svgImage({x: 0, y: 0, "xlink:href": "test.png"}),
                result = tree.appendTo(mockNode);
            assert(result instanceof Node);
            assert(result.ownerDocument === mockDocument);
            assert(result.nodeName === "image");
            assert(result._namespace === "http://www.w3.org/2000/svg");
            assert(result._hasAttribute("http://www.w3.org/1999/xlink", "href") === "test.png");
            assert(result._hasAttribute("", "x") === 0);
        });

    });

});
