(function () { /* Begin of privacy scope */
    "use strict";

    var UMDjson = {
        "type": "Program",
        "body": [
            {
                "type": "ExpressionStatement",
                "expression": {
                    "type": "CallExpression",
                    "callee": {
                        "type": "FunctionExpression",
                        "id": null,
                        "params": [
                            {
                                "type": "Identifier",
                                "name": "root",
                                "range": [
                                    11,
                                    15
                                ]
                            },
                            {
                                "type": "Identifier",
                                "name": "factory",
                                "range": [
                                    17,
                                    24
                                ]
                            }
                        ],
                        "defaults": [],
                        "body": {
                            "type": "BlockStatement",
                            "body": [
                                {
                                    "type": "ExpressionStatement",
                                    "expression": {
                                        "type": "Literal",
                                        "value": "use strict",
                                        "range": [
                                            33,
                                            45
                                        ]
                                    },
                                    "range": [
                                        33,
                                        46
                                    ]
                                },
                                {
                                    "type": "IfStatement",
                                    "test": {
                                        "type": "LogicalExpression",
                                        "operator": "&&",
                                        "left": {
                                            "type": "BinaryExpression",
                                            "operator": "===",
                                            "left": {
                                                "type": "UnaryExpression",
                                                "operator": "typeof",
                                                "argument": {
                                                    "type": "Identifier",
                                                    "name": "define",
                                                    "range": [
                                                        183,
                                                        189
                                                    ]
                                                },
                                                "prefix": true,
                                                "range": [
                                                    176,
                                                    189
                                                ]
                                            },
                                            "right": {
                                                "type": "Literal",
                                                "value": "function",
                                                "range": [
                                                    194,
                                                    204
                                                ]
                                            },
                                            "range": [
                                                176,
                                                204
                                            ]
                                        },
                                        "right": {
                                            "type": "MemberExpression",
                                            "computed": false,
                                            "object": {
                                                "type": "Identifier",
                                                "name": "define",
                                                "range": [
                                                    208,
                                                    214
                                                ]
                                            },
                                            "property": {
                                                "type": "Identifier",
                                                "name": "amd",
                                                "range": [
                                                    215,
                                                    218
                                                ]
                                            },
                                            "range": [
                                                208,
                                                218
                                            ]
                                        },
                                        "range": [
                                            176,
                                            218
                                        ]
                                    },
                                    "consequent": {
                                        "type": "BlockStatement",
                                        "body": [
                                            {
                                                "type": "ExpressionStatement",
                                                "expression": {
                                                    "type": "CallExpression",
                                                    "callee": {
                                                        "type": "Identifier",
                                                        "name": "define",
                                                        "range": [
                                                            231,
                                                            237
                                                        ]
                                                    },
                                                    "arguments": [
                                                        {
                                                            "type":
                                                              "ArrayExpression",
                                                            "elements": [
                                                                {
                                                                    "type":
                                                                      "Literal",
                                                                    "value":
                                                                      "exports",
                                                                    "range": [
                                                                        239,
                                                                        248
                                                                    ]
                                                                }
                                                            ],
                                                            "range": [
                                                                238,
                                                                249
                                                            ]
                                                        },
                                                        {
                                                            "type":
                                                                   "Identifier",
                                                            "name": "factory",
                                                            "range": [
                                                                251,
                                                                258
                                                            ]
                                                        }
                                                    ],
                                                    "range": [
                                                        231,
                                                        259
                                                    ]
                                                },
                                                "range": [
                                                    231,
                                                    260
                                                ]
                                            }
                                        ],
                                        "range": [
                                            220,
                                            267
                                        ]
                                    },
                                    "alternate": {
                                        "type": "IfStatement",
                                        "test": {
                                            "type": "BinaryExpression",
                                            "operator": "!==",
                                            "left": {
                                                "type": "UnaryExpression",
                                                "operator": "typeof",
                                                "argument": {
                                                    "type": "Identifier",
                                                    "name": "exports",
                                                    "range": [
                                                        284,
                                                        291
                                                    ]
                                                },
                                                "prefix": true,
                                                "range": [
                                                    277,
                                                    291
                                                ]
                                            },
                                            "right": {
                                                "type": "Literal",
                                                "value": "undefined",
                                                "range": [
                                                    296,
                                                    307
                                                ]
                                            },
                                            "range": [
                                                277,
                                                307
                                            ]
                                        },
                                        "consequent": {
                                            "type": "BlockStatement",
                                            "body": [
                                                {
                                                    "type":
                                                          "ExpressionStatement",
                                                    "expression": {
                                                        "type":
                                                               "CallExpression",
                                                        "callee": {
                                                            "type":
                                                                   "Identifier",
                                                            "name": "factory",
                                                            "range": [
                                                                320,
                                                                327
                                                            ]
                                                        },
                                                        "arguments": [
                                                            {
                                                                "type":
                                                                   "Identifier",
                                                                "name":
                                                                      "exports",
                                                                "range": [
                                                                    328,
                                                                    335
                                                                ]
                                                            }
                                                        ],
                                                        "range": [
                                                            320,
                                                            336
                                                        ]
                                                    },
                                                    "range": [
                                                        320,
                                                        337
                                                    ]
                                                }
                                            ],
                                            "range": [
                                                309,
                                                344
                                            ]
                                        },
                                        "alternate": {
                                            "type": "BlockStatement",
                                            "body": [
                                                {
                                                    "type":
                                                          "ExpressionStatement",
                                                    "expression": {
                                                        "type":
                                                               "CallExpression",
                                                        "callee": {
                                                            "type":
                                                                   "Identifier",
                                                            "name": "factory",
                                                            "range": [
                                                                361,
                                                                368
                                                            ]
                                                        },
                                                        "arguments": [
                                                            {
                                                                "type":
                                                         "AssignmentExpression",
                                                                "operator": "=",
                                                                "left": {
                                                                    "type":
                                                             "MemberExpression",
                                                                    "computed":
                                                                          false,
                                                                    "object": {
                                                                        "type":
                                                                   "Identifier",
                                                                        "name":
                                                                         "root",
                                                                        "range":
                                                                        [
                                                                            370,
                                                                            374
                                                                        ]
                                                                    },
                                                                    "property":
                                                                    {
                                                                        "type":
                                                                   "Identifier",
                                                                        "name":
                                                                          "gpf",
                                                                        "range":
                                                                        [
                                                                            375,
                                                                            378
                                                                        ]
                                                                    },
                                                                    "range": [
                                                                        370,
                                                                        378
                                                                    ]
                                                                },
                                                                "right": {
                                                                    "type":
                                                             "ObjectExpression",
                                                                    "properties"
                                                                           : [],
                                                                    "range": [
                                                                        381,
                                                                        383
                                                                    ]
                                                                },
                                                                "range": [
                                                                    370,
                                                                    383
                                                                ]
                                                            }
                                                        ],
                                                        "range": [
                                                            361,
                                                            385
                                                        ]
                                                    },
                                                    "range": [
                                                        361,
                                                        386
                                                    ]
                                                }
                                            ],
                                            "range": [
                                                350,
                                                393
                                            ]
                                        },
                                        "range": [
                                            273,
                                            393
                                        ]
                                    },
                                    "range": [
                                        172,
                                        393
                                    ],
                                    "leadingComments": [
                                        {
                                            "type": "Line",
                                            "value": " Universal Module Definit"
                                + "ion (UMD) to support AMD, CommonJS/Node.js,",
                                            "range": {
                                                "0": 54,
                                                "1": 124
                                            },
                                            "extendedRange": [
                                                46,
                                                172
                                            ]
                                        },
                                        {
                                            "type": "Line",
                                            "value": " Rhino, and plain browser"
                                                                  + " loading.",
                                            "range": {
                                                "0": 130,
                                                "1": 166
                                            },
                                            "extendedRange": [
                                                46,
                                                172
                                            ]
                                        }
                                    ]
                                }
                            ],
                            "range": [
                                26,
                                396
                            ]
                        },
                        "rest": null,
                        "generator": false,
                        "expression": false,
                        "range": [
                            1,
                            396
                        ]
                    },
                    "arguments": [
                        {
                            "type": "ThisExpression",
                            "range": [
                                397,
                                401
                            ]
                        },
                        {
                            "type": "FunctionExpression",
                            "id": null,
                            "params": [
                                {
                                    "type": "Identifier",
                                    "name": "gpf",
                                    "range": [
                                        413,
                                        416
                                    ]
                                }
                            ],
                            "defaults": [],
                            "body": {
                                "type": "BlockStatement",
                                "body": [
                                    {
                                        "type": "ExpressionStatement",
                                        "expression": {
                                            "type": "Literal",
                                            "value": "use strict",
                                            "range": [
                                                425,
                                                437
                                            ]
                                        },
                                        "range": [
                                            425,
                                            438
                                        ]
                                    },
                                    {
                                        "type": "ExpressionStatement",
                                        "expression": {
                                            "type": "Identifier",
                                            "name": "__gpf__",
                                            "range": [
                                                446,
                                                453
                                            ]
                                        },
                                        "range": [
                                            446,
                                            454
                                        ]
                                    }
                                ],
                                "range": [
                                    418,
                                    457
                                ]
                            },
                            "rest": null,
                            "generator": false,
                            "expression": false,
                            "range": [
                                403,
                                457
                            ]
                        }
                    ],
                    "range": [
                        1,
                        458
                    ]
                },
                "range": [
                    0,
                    460
                ]
            }
        ],
        "range": [
            0,
            460
        ]
    };

    gpf.declareTests({

        makeExample: [

            function (test) {
                test.title("UMD.js parsed esprima, getting __gpf__");
                var
                    node = new gpf.xml.ConstNode(UMDjson),
        // body/item[@type='ExpressionStatement' and expression/@name='__gpf__']
                    xpath = new gpf.xml.XPath({
                        type: gpf.xml.NODE_ELEMENT,
                        name: "body",
                        relative: false,
                        then: {
                            type: gpf.xml.NODE_ELEMENT,
                            name: "item",
                            filter: {
                                and: [ {
                                    type: gpf.xml.NODE_ATTRIBUTE,
                                    name: "type",
                                    text: "ExpressionStatement"
                                }, {
                                    type: gpf.xml.NODE_ELEMENT,
                                    name: "expression",
                                    then: {
                                        type: gpf.xml.NODE_ATTRIBUTE,
                                        name: "name",
                                        text: "__gpf__"
                                    }
                                }]
                            }
                        }
                    }),
                    result,
                    idx, children, child, expression;
                result = xpath.selectNodes(node);
                test.notEqual(result, null, "A result is returned");
                test.equal(result.length, 1, "One result is returned");
                result = result[0];
                test.equal(result.localName(), "item", "item OK");
                test.equal(result.attributes("type"), "ExpressionStatement",
                    "item/@type OK");
                expression = null;
                children = result.children();
                for (idx = 0; idx < children.length; ++idx) {
                    child = children[idx];
                    if (child.localName() === "expression") {
                        expression = child;
                    }
                }
                test.notEqual(expression, null, "item/expression OK");
                test.equal(expression.attributes("name"), "__gpf__",
                    "item/expression/@name OK");
            }

        ]
    });

})(); /* End of privacy scope */