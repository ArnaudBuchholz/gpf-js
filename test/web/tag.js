"use strict";

describe("web/tag", function () {

    describe("gpf.web.createTagFunction", function () {

        it("creates a generic shortcut for DOM generation", function () {
            var tag = gpf.web.createTagFunction(),
                tree = tag({nodeName: "div"}, tag({nodeName: "span"}));
            assert(tree.toString() === "<div><span/></div>");
        });

        it("requires node name when using the generic shortcut", function () {
            var exceptionCaught;
            try {
                var tag = gpf.web.createTagFunction();
                tag();
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught === gpf.Error.MissingNodeName);
        });

        it("creates shortcut for tag generation", function () {
            var div = gpf.web.createTagFunction("div"),
                tree = div("Hello world!");
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
                    _children: [],
                    appendChild: function (child) {
                        this._children.push(child);
                        return child;
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
                tree = div("Hello ", span("World!"));
            var result = tree.appendTo(mockNode);
            assert(result instanceof nodeProto);
            assert(result.ownerDocument === mockDocument);
            assert(result.nodeName === "div");
            assert(result._children.length === 2);
            assert(result._children[0] === "Hello ");
            assert(result._children[1] instanceof nodeProto);
            assert(result._children[1]._children[0] === "World!");
        });

    });

});
