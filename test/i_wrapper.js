(function () { /* Begin of privacy scope */
    "use strict";

    var
        IExample = gpf.define("IExample", gpf.interfaces.Interface, {

            "[test1]": [gpf.$ClassEventHandler()],
            test1: function (param1, eventsHandler) {
                gpf.interfaces.ignoreParameter(param1);
                gpf.interfaces.ignoreParameter(eventsHandler);
            },

            test2: function (param1) {
                gpf.interfaces.ignoreParameter(param1);
            }

        }),

        Example = gpf.define("Example", {

            "[Class]": [gpf.$InterfaceImplement(IExample)],

            private: {

                _sequences: []

            },

            public: {

                constructor: function () {
                    this._sequences = [];
                },

                test1: function (param1, eventsHandler) {
                    this._sequences.push(param1);
                    gpf.events.fire.apply(this, ["TEST1", {
                        param1: param1,
                        param2: "2"
                    }, eventsHandler]);
                },

                test2: function (param1) {
                    this._sequences.push(param1);
                },

                get: function () {
                    return this._sequences.join("");
                }

            }

        });

    gpf.declareTests({

        "wrapper": [

            function (test) {
                var WExample = gpf.interfaces.wrap(IExample),
                    example = new Example(),
                    wrapped = new WExample(example);
                test.wait();
                wrapped
                    .test1("a")
                    .test2("b")
                    .test1("c")
                    .$catch(function (event) {
                        test.assert(false, "Error raised: " + event.type());
                    })
                    .$finally(function (/*event*/) {
                        test.equal(example.get(), "abc", "Correct sequence");
                        test.done();
                    });
            }

        ]

    });

})(); /* End of privacy scope */
