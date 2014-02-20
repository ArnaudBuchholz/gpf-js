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

        _NODE_TYPE_ELEMENT = 0,
        _NODE_TYPE_ATTRIBUTE = 1,

        // a/b/c
        _sample1 = {
            nodeType: _NODE_TYPE_ELEMENT,
            valueType: _VALUE_TYPE_NAME,
            value: "a",
            filter: null,
            then: {
                nodeType: _NODE_TYPE_ELEMENT,
                valueType: _VALUE_TYPE_NAME,
                value: "b",
                filter: null,
                then: {
                    nodeType: _NODE_TYPE_ELEMENT,
                    valueType: _VALUE_TYPE_NAME,
                    value: "c",
                    filter: null,
                    then: null
                }
            }
        },

        // a[b and c]
        _sample2 = {
            nodeType: _NODE_TYPE_ELEMENT,
            valueType: _VALUE_TYPE_NAME,
            value: "a",
            filter: {
                operator: "and",
                items: [
                    {
                        nodeType: _NODE_TYPE_ELEMENT,
                        valueType: _VALUE_TYPE_NAME,
                        value: "b",
                        filter: null,
                        then: null
                    }, {
                        nodeType: _NODE_TYPE_ELEMENT,
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
            nodeType: _NODE_TYPE_ELEMENT,
            valueType: _VALUE_TYPE_NAME,
            value: "a",
            filter: {
                operator: "and",
                items: [
                    {
                        nodeType: _NODE_TYPE_ATTRIBUTE,
                        valueType: _VALUE_TYPE_NAME,
                        value: "d",
                        filter: {
                            operator: "and",
                            items: [{
                                nodeType: _NODE_TYPE_TEXT,
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


    gpf.xml.XPathFilter = gpf.Class.extend({

        init: function (xpath) {
            this._reset();
            this._compile(xpath);
        },

        _compile: function  (xpath) {

        },

        evaluate: function (node) {

        }

    });


}()); /* End of privacy scope */
