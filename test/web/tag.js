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
            var div = gpf.web.createTagFunction("div"),
                tree = div("Hello World!");
            assert(tree.toString() === "<div>Hello World!</div>");
        });

        it("supports tree building (parameters)", function () {
            var div = gpf.web.createTagFunction("div"),
                span = gpf.web.createTagFunction("span"),
                tree = div({className: "test1"}, "Hello ", span({className: "test2"}, "World"));
            assert(tree.toString() === "<div class=\"test1\">Hello <span class=\"test2\">World</span></div>");
        });

        it("supports tree building (array parameter)", function () {
            var div = gpf.web.createTagFunction("div"),
                span = gpf.web.createTagFunction("span"),
                tree = div([span("Wor"), span("Wor")]);
            assert(tree.toString() === "<div>Hello <span>Wor</span><span>ld</span></div>");
        });

        it("allows DOM injection", function () {
            var nodeProto = {
                    _attributes: {},
                    _children: [],
                    appendChild: function (child) {
                        this._children.push(child);
                        return child;
                    },
                    setAttribute: function (name, value) {
                        if (!this.hasOwnAttribute("_attributes")) {
                            this._attributes = {};
                        }
                        this._attributes[name] = value;
                    }
                },
                mockDocument = {
                    createElement: function (nodeName) {
                        var node = Object.create(nodeProto);
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
            assert(result instanceof nodeProto);
            assert(result.ownerDocument === mockDocument);
            assert(result.nodeName === "div");
            assert(result._attributes.className === "test");
            assert(result._children.length === 2);
            assert(result._children[0] === "Hello ");
            assert(result._children[1] instanceof nodeProto);
            assert(result._children[1]._children[0] === "World!");
        });

    });

});
