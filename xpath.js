(function(){ /* Begin of privacy scope */
    "use strict";

/*
    Will be created using JISON but as I am not decided yet, I put everything
    hard-coded
*/

/*
    var
        // a/b/c
        _sample1 = {
            nodeType: gpf.xml.NODE_ELEMENT,
            name: "a",
            then: {
                nodeType: gpf.xml.NODE_ELEMENT,
                name: "b",
                then: {
                    nodeType: gpf.xml.NODE_ELEMENT,
                    name: "c"
                }
            }
        },

        // a[b and c]
        _sample2 = {
            nodeType: gpf.xml.NODE_ELEMENT,
            name: "a",
            filter: {
                and: [ {
                    nodeType: gpf.xml.NODE_ELEMENT,
                    name: "b"
                }, {
                    nodeType: gpf.xml.NODE_ELEMENT,
                    name: "c"
                }]
            }
        },
        // a[@d='1']
        _sample3 = {
            nodeType: gpf.xml.NODE_ELEMENT,
            name: "a",
            filter: {
                and: [{
                    nodeType: gpf.xml.NODE_ATTRIBUTE,
                    name: "d",
                    value: "1"
                }]
            }
        },
        //a
        _sample4 = {
            nodeType: gpf.xml.NODE_ELEMENT,
            name: "a",
            relative: false
        }
    ;
*/

    gpf.xml.XPath = gpf.Class.extend({

        _xpath: null,

        init: function (xpath) {
            this._reset();
            if ("string" === typeof xpath) {
                this._xpath = this._compile(xpath);
            } else {
                this._xpath = xpath;
            }
        },

        /**
         * Compile the XPATH specifier
         *
         * @param {string} xpath
         * @private
         */
        _compile: function (xpath) {
            gpf.interfaces.ignoreParameter(xpath);
            this._xpath = null;
        },

        /**
         *
         * @param {gpf.xml.IXmlConstNode} node
         * @return {gpf.xml.IXmlConstNode[]}
         */
        selectNodes: function (node) {
            var
                expr = this._xpath,
                resultSet = [node],
                idx, children;

            if (expr.nodeType === gpf.xml.NODE_ELEMENT) {
                for (idx = 0; idx < resultSet.length; ++idx) {
                    children = node.children();
                    // Select children corresponding to the criteria
                }
            } else {
                for (idx = 0; idx < resultSet.length; ++idx) {
                    children = node.attributes();
                    // Select children corresponding to the criteria
                }
            }

            return resultSet;
        }

    });


}()); /* End of privacy scope */
