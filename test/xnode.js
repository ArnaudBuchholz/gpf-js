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
                            att3: "XML rulez"
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

            }

        ]

    });

})(); /* End of privacy scope */

