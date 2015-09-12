/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
    /*global _gpfDefine*/ // Shortcut for gpf.define
/*#endif*/

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
     * Internal helper to apply a function on a list of nodes.
     *
     * @param {gpf.xml.IXmlConstNode[]} nodes
     * @param {Function} func
     * @param {*} param
     * @param {gpf.xml.IXmlConstNode[]} resultSet
     * @private
     */
    function _each(nodes, func, param, resultSet) {
        var
            idx,
            node;
        for (idx = 0; idx < nodes.length; ++idx) {
            node = nodes[idx];
            func(node, param, resultSet);
        }
    }

    /**
     * Test an expression with type = NODE_ELEMENT
     *
     * @param {gpf.xml.IXmlConstNode} node
     * @param {Object} expr
     * @param {gpf.xml.IXmlConstNode[]} resultSet
     * @private
     */
    function _testELEMENT(node, expr, resultSet) {
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
                resultSet.push(child);
            }
            if (undefined !== expr.relative && !expr.relative) {
                _testELEMENT(child, expr, resultSet);
            }
        }
    }

    /**
     * Test an expression with type = NODE_ATTRIBUTE
     *
     * @param {gpf.xml.IXmlConstNode} node
     * @param {Object} expr
     * @param {gpf.xml.IXmlConstNode[]} resultSet
     * @private
     */
    function _testATTRIBUTE(node, expr, resultSet) {
        var
            attributes,
            name,
            text;
        if (expr.name) {
            text = node.attributes(expr.name);
            if (undefined !== text && (!expr.text || text === expr.text)) {
                resultSet.push(node);
            }

        } else {
            attributes = node.attributes();
            for (name in attributes) {
                if (attributes.hasOwnProperty(name)) {
                    text = attributes[name];
                    if (!expr.text || text === expr.text) {
                        resultSet.push(node);
                        break;
                    }
                }
            }
        }
    }

    /**
     * Apply the expression on each element of the nodeSet and build the
     * resultSet
     *
     * @param {gpf.xml.IXmlConstNode[]} nodeSet
     * @param {Object} expr
     * @param {gpf.xml.IXmlConstNode[]} resultSet
     * @private
     */
    function _test(nodeSet, expr, resultSet) {
        if (gpf.xml.NODE_ELEMENT === expr.type) {
            _each(nodeSet, _testELEMENT, expr, resultSet);
        } else if(gpf.xml.NODE_ATTRIBUTE === expr.type) {
            _each(nodeSet, _testATTRIBUTE, expr, resultSet);
        }
    }

    /**
     * Apply the filter expression on the node
     *
     * @param {gpf.xml.IXmlConstNode} node
     * @param {Object} expr
     * @param {gpf.xml.IXmlConstNode[]} resultSet
     * @private
     */
    function _filter(node, expr, resultSet) {
        var
            selectedNodes,
            conditions,
            type,
            idx,
            condition;
        if (expr.and) {
            conditions = expr.and;
            type = 0;
        } else if (expr.or) {
            conditions = expr.or;
            type = 1;
        }
        for (idx = 0; idx < conditions.length; ++idx) {
            condition = conditions[idx];
            if (condition.and || condition.or) {
                selectedNodes = [];
                _filter(node, condition, selectedNodes);
            } else {
                selectedNodes = _select(node, condition);
            }
            if (0 === type && selectedNodes.length === 0) {
                return;
            }
            if (1 === type && selectedNodes.length !== 0) {
                resultSet.push(node);
                return;
            }
        }
        if (0 === type) {
            resultSet.push(node);
        }
    }

    /**
     * Select the expression on the current node
     *
     * @param {gpf.xml.IXmlConstNode} node
     * @param {Object} expr
     * @private
     */
    function _select(node, expr) {
        var
            resultSet,
            nodeSet = [node];
        while (expr) {
            resultSet = [];
            _test(nodeSet, expr, resultSet);
            if (0 === resultSet.length) {
                return [];
            }
            nodeSet = resultSet;
            if (expr.filter) {
                resultSet = [];
                _each(nodeSet, _filter, expr.filter, resultSet);
                if (0 === resultSet.length) {
                    return [];
                }
                nodeSet = resultSet;
            }
            expr = expr.then;
        }
        return resultSet;
    }

    /**
     * XPath parser and selector
     *
     * @class gpf.xml.XPath
     */
    _gpfDefine("gpf.xml.XPath", Object, {

        _xpath: null,

        constructor: function (xpath) {
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
         * @param {String} xpath
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
            return _select(node, this._xpath);
        }

    });

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/