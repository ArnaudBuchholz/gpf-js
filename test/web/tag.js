"use strict";

describe("web/tag", function () {

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
            function Node () {}
            Node.prototype = {
                _attributes: {},
                _children: [],
                appendChild: function (child) {
                    if (!this.hasOwnProperty("_children")) {
                        this._children = [];
                    }
                    this._children.push(child);
                    return child;
                },
                setAttribute: function (name, value) {
                    if (!this.hasOwnProperty("_attributes")) {
                        this._attributes = {};
                    }
                    this._attributes[name] = value;
                }
            };
            var mockDocument = {
                    createElement: function (nodeName) {
                        var node = new Node();
                        node.nodeName = nodeName;
                        node.ownerDocument = this;
                        return node;
                    },
                    createTextNode: function (text) {
                        return text;
                    }
                },
                mockNode = mockDocument.createElement("any"),
                div = gpf.web.createTagFunction("div"),
                span = gpf.web.createTagFunction("span"),
                tree = div({className: "test"}, "Hello ", span("World!"));
            var result = tree.appendTo(mockNode);
            assert(result instanceof Node);
            assert(result.ownerDocument === mockDocument);
            assert(result.nodeName === "div");
            assert(result._attributes["class"] === "test");
            assert(result._children.length === 2);
            assert(result._children[0] === "Hello ");
            assert(result._children[1] instanceof Node);
            assert(result._children[1]._children[0] === "World!");
        });

    });

});
