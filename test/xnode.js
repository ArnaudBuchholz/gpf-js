(function () {/* Begin of privacy scope */
    "use strict";

    /*jshint -W027*/ // Done on purpose until gpf.declareTests is removed
    return;

    gpf.declareTests({

        "toConstNode": [

            function (test) {
                test.title("Convert a simple object into IXMLConstNode");
                var
                    root = new gpf.xml.ConstNode({
                        att1: "Hello",
                        att2: "World!",
                        child1: {
                            att3: 123
                        }
                    }),
                    child;
                test.equal(root.localName(), "root", "Root name");
                test.equal(root.attributes("att1"), "Hello", "First attribute");
                test.like(root.attributes(), {
                    att1: "Hello",
                    att2: "World!"
                }, "All attributes");
                child = root.children(0);
                test.notEqual(child, null, "Get first child");
                test.equal(child.parentNode(), root, "Parent points to root");
                test.equal(child.localName(), "child1", "Child name");
                test.equal(child.attributes("att3"), 123, "Child attribute");
                test.equal(child.attributes("att4"), undefined,
                    "Child unknown attribute");
                test.equal(child.nextSibling(), null, "No next sibling");
                test.equal(child.previousSibling(), null,
                    "No previous sibling");
            },

            function (test) {
                test.title("Convert an object with arrays into IXMLConstNode");
                var
                    root = new gpf.xml.ConstNode({
                        array1: ["Hello", "World!"],
                        array2: [{
                            att1: "Hello",
                            att2: "World!"
                        }, "Mixed"]
                    }, "complex"),
                    array1, child, array2;
                test.equal(root.localName(), "complex", "Root name");
                test.equal(root.children().length, 2, "Two children");
                array1 = root.children(0);
                test.notEqual(array1, null, "> First child");
                test.equal(array1.localName(), "array1", "> First child name");
                test.equal(array1.children().length, 2,
                    "> First child children count");
                test.log("> Processing first child children");
                child = array1.children(0);
                test.notEqual(child, null, "  > Child obtained");
                test.equal(child.localName(), "item", "  > Child name");
                test.equal(child.children().length, 0,
                    "  > Children count");
                test.equal(child.nodeValue(),
                    "Hello", "  > First child value");
                test.equal(array1.children(1).nodeValue(),
                    "World!", "  > Second child value");
                test.log("> Processing second child");
                array2 = array1.nextSibling();
                test.notEqual(array2, null,
                    "> Accessible using nextSibling on first child");
                test.equal(array2.previousSibling(), array1,
                    "> First child accessible using previousSibling");
                test.log("> Processing second child children");
                child = array2.children(0);
                test.notEqual(child, null, "  > First child obtained");
                test.equal(child.localName(), "item", "    > First child name");
                test.equal(child.attributes("att1"), "Hello",
                    "    > First child attribute att1");
                test.equal(child.attributes("att2"), "World!",
                    "    > First child attribute att2");
                test.equal(child.attributes("att3"), undefined,
                    "    > First child unknown attribute att3");
                child = child.nextSibling();
                test.notEqual(child, null, "  > Second child obtained");
                test.equal(child.nodeValue(), "Mixed",
                    "    > Second child value");
            }

        ],

        "toXML": [

            function (test) {
                test.title("Convert a simple object into IXMLConstNode");
                var
                    root = new gpf.xml.ConstNode({
                        att1: "Hello",
                        att2: "World!",
                        child1: {
                            att3: 123
                        }
                    }),
                    stream = gpf.stringToStream(),
                    contentHandler = new gpf.xml.Writer(stream);
                root.toXml(contentHandler, function (event) {
                    test.equal(event.type(), "ready", "Completed");
                    gpf.stringFromStream(stream, function (event) {
                        test.equal(event.get("buffer"), "<root att1=\"Hello" +
                            "\" att2=\"World!\"><child1 att3=\"123\"/></root>",
                            "XML is well formed");
                    });
                });
            },

            function (test) {
                test.title("Convert an object with arrays into IXMLConstNode");
                var
                    root = new gpf.xml.ConstNode({
                        array1: ["Hello", "World!"],
                        array2: [{
                            att1: "Hello",
                            att2: "World!"
                        }, "Mixed"]
                    }, "complex"),
                    stream = gpf.stringToStream(),
                    contentHandler = new gpf.xml.Writer(stream);
                root.toXml(contentHandler, function (event) {
                    test.equal(event.type(), "ready", "Completed");
                    gpf.stringFromStream(stream, function (event) {
                        test.equal(event.get("buffer"),  "<complex><array1><" +
                        "item>Hello</item><item>World!</item></array1><array2" +
                        "><item att1=\"Hello\" att2=\"World!\"/><item>Mixed</" +
                        "item></array2></complex>", "XML is well formed");
                    });
                });
            }

        ]

    });

})(); /* End of privacy scope */
