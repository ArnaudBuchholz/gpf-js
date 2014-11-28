(function () { /* Begin of privacy scope */
    "use strict";

    gpf.declareTests({

        create: [

            function (test) {
                test.title("Simple creation");
                var params = gpf.Parameter.create([{
                        name: "StringParameter",
                        description: "This is a string parameter"
                    }, {
                        name: "BooleanParameter",
                        description: "This is a boolean parameter",
                        type: "boolean"
                    }]),
                    param;
                test.equal(params.length, 2, "Correct number of parameters");
                param = params[0];
                test.log("First parameter");
                test.equal(param.name(), "StringParameter", "Name");
                test.equal(param.description(), "This is a string parameter",
                    "Description");
                test.equal(param.type(), gpf.Parameter.TYPE_STRING, "Type");
                param = params[1];
                test.log("Second parameter");
                test.equal(param.name(), "BooleanParameter", "Name");
                test.equal(param.description(), "This is a boolean parameter",
                    "Description");
                test.equal(param.type(), gpf.Parameter.TYPE_BOOLEAN, "Type");
                test.equal(param.defaultValue(), false, "Default value");
            }

        ],

        parse: [

            function (test) {
                test.title("Simple parsing");
                var params = gpf.Parameter.create([{
                        name: "StringParameter",
                        description: "This is a string parameter"
                    }, {
                        name: "BooleanParameter",
                        description: "This is a boolean parameter",
                        type: "boolean"
                    }]),
                    result;
                result = gpf.Parameter.parse(params, [
                    "Test",
                    "1"
                ]);
                test.equal(result.StringParameter, "Test",
                    "String parameter found");
                test.equal(result.BooleanParameter, true,
                    "Boolean parameter found");
            }

        ]

    });

})(); /* End of privacy scope */