(function(){ /* Begin of privacy scope */
    "use strict";

/*
    Will be created using JISON but as I am not decided yet, I put everything
    hard-coded
*/

    // name[conditions]

    var
        _VALUE_TYPE_NAME = 0,
        _VALUE_TYPE_TEXT = 1,

        // a/b/c
        _sample1 = {
            nodeType: gpf.xml.NODE_ELEMENT,
            valueType: _VALUE_TYPE_NAME,
            value: "a",
            filter: null,
            then: {
                nodeType: gpf.xml.NODE_ELEMENT,
                valueType: _VALUE_TYPE_NAME,
                value: "b",
                filter: null,
                then: {
                    nodeType: gpf.xml.NODE_ELEMENT,
                    valueType: _VALUE_TYPE_NAME,
                    value: "c",
                    filter: null,
                    then: null
                }
            }
        },

        // a[b and c]
        _sample2 = {
            nodeType: gpf.xml.NODE_ELEMENT,
            valueType: _VALUE_TYPE_NAME,
            value: "a",
            filter: {
                operator: "and",
                items: [
                    {
                        nodeType: gpf.xml.NODE_ELEMENT,
                        valueType: _VALUE_TYPE_NAME,
                        value: "b",
                        filter: null,
                        then: null
                    }, {
                        nodeType: gpf.xml.NODE_ELEMENT,
                        valueType: _VALUE_TYPE_NAME,
                        value: "c",
                        filter: null,
                        then: null
                    }
                ]
            },
            then: null
        },
        // a[@d='1'] => a[@d[.='1']]
        _sample2 = {
            nodeType: gpf.xml.NODE_ELEMENT,
            valueType: _VALUE_TYPE_NAME,
            value: "a",
            filter: {
                operator: "and",
                items: [
                    {
                        nodeType: gpf.xml.NODE_ATTRIBUTE,
                        valueType: _VALUE_TYPE_NAME,
                        value: "d",
                        filter: {
                            operator: "and",
                            items: [{
                                nodeType: gpf.xml.NODE_TEXT,
                                valueType: _VALUE_TYPE_VALUE,
                                value: "1",
                                filter: null,
                                then: null
                            }]
                        },
                        then: null
                    }
                ]
            },
            then: null
        }
    ;


    gpf.xml.XPath = gpf.Class.extend({

        _xpath: null,

        init: function (xpath) {
            this._reset();
            if ("string" === typeof xpath) {
                this._xpath = this._compile(xpath)
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
         * @return {gpf.xml.IXmlConstNode|null}
         */
        evaluate: function (node) {
            gpf.interfaces.ignoreParameter(node);
            return null;
        }

    });


}()); /* End of privacy scope */
