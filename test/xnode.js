(function () { /* Begin of privacy scope */
    "use strict";

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
                child = root.children()[0];
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
                        array1: [ "Hello", "World!" ],
                        array2: [{
                            att1: "Hello",
                            att2: "World!"
                        }, "Mixed"]
                    }, "complex"),
                    child;
                test.equal(root.localName(), "complex", "Root name");
                test.equal(root.children().length, 2, "Two children");
                child = root.children()[0];
                test.equal(child.localName(), "array1", "First child name");
            }

        ]

    });

})(); /* End of privacy scope */

