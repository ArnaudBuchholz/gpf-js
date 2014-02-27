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
            type: gpf.xml.NODE_ELEMENT,
            name: "a",
            then: {
                type: gpf.xml.NODE_ELEMENT,
                name: "b",
                then: {
                    type: gpf.xml.NODE_ELEMENT,
                    name: "c"
                }
            }
        },

        // a[b and c]
        _sample2 = {
            type: gpf.xml.NODE_ELEMENT,
            name: "a",
            filter: {
                and: [ {
                    type: gpf.xml.NODE_ELEMENT,
                    name: "b"
                }, {
                    type: gpf.xml.NODE_ELEMENT,
                    name: "c"
                }]
            }
        },
        // a[@d='1']
        _sample3 = {
            type: gpf.xml.NODE_ELEMENT,
            name: "a",
            filter: {
                and: [{
                    type: gpf.xml.NODE_ATTRIBUTE,
                    name: "d",
                    text: "1"
                }]
            }
        },
        //a
        _sample4 = {
            type: gpf.xml.NODE_ELEMENT,
            name: "a",
            relative: false
        }
    ;
*/

    /**
     * Result set, contains node and can be enumerated
     *
     * @constructor
     * @private
     */
    function ResultSet() {
        this._nodes = [];
        // Define only on first use
        if (undefined === ResultSet.prototype.add) {
            gpf.extend(ResultSet.prototype, {

                push: function (node) {
                    var idx;
                    if (node instanceof Array) {
                        for (idx = 0; idx < node.length; ++idx) {
                            this._nodes.push(node);
                        }
                    } else {
                        this._nodes.push(node);
                    }
                },

                each: function (test) {
                    var
                        result = new ResultSet(),
                        idx, node, nodes;
                    for (idx = 0; idx < this._nodes.length; ++idx) {
                        node = this._nodes[idx];
                        nodes = test(idx);
                        if (nodes) {
                            result.push(nodes);
                        }
                    }
                    return result;
                }
            });
        }
    }

    function _testELEMENT(node, expr, result) {
        var
            children = node.children(),
            child,
            idx,
            keep;
        for (idx = 0; idx < children.length; ++idx) {
            keep = true;
            child = children[idx];
            if (expr.name && child.localName() !== expr.name) {
                keep = false;
            } else if (expr.text && child.textContent() !== expr.text) {
                keep = false;
            }
            if (keep) {
                result.push(child);
            }
            if (undefined !== expr.relative && !expr.relative) {
                _testELEMENT(child, expr, result);
            }
        }
        return result;
    }

    function _testATTRIBUTE(node, expr, result) {
        var
            attributes,
            attribute;

        if (expr.name) {
            attribute = node.attributes(expr.name);
        } else {
            attributes = node.attributes();
        }
        return result;
    }

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

        _reset: function () {

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
//                expr = this._xpath,
                resultSet = new ResultSet();
            resultSet.push(node);
/*
            while (expr) {
                if (gpf.xml.NODE_ELEMENT === expr.type) {
                    resultSet.each(function (node) {
                        var
                            children = node.children(),
                            idx;
                        for (= 0; idx
                            });
                    }

            }
            if (expr.type === ) {
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
*/
            return resultSet;
        }

    });


}()); /* End of privacy scope */
