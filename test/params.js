(function () { /* Begin of privacy scope */
    "use strict";

    gpf.declareTests({

        create: [

            function (test) {
                test.title("Simple creation");
                var params = gpf.Parameter.create([{
                        name: "StringParameter",
                        description: "This is a string parameter"
                    //}, {
                    //
                    }]),
                    param;
                test.equal(params.length, 1, "Correct number of parameters");
                param = params[0];
                test.log("First parameter");
                test.equal(param.name(), "StringParameter", "Name");
                test.equal(param.description(), "This is a string parameter",
                    "Description");
                test.equal(param.type(), gpf.Parameter.TYPE_STRING, "Type");
            }

        ]

    });

})(); /* End of privacy scope */