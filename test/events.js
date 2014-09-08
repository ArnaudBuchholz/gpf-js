(function () { /* Begin of privacy scope */
    "use strict";

    gpf.declareTests({

        "defaults": [

            function (test) {
                test.title("Default event");
                var event = new gpf.events.Event("test");
                test.equal(event.type(), "test", "Event type");
                test.equal(event.scope(), gpf.context(), "Event default scope");
                test.equal(event.cancelable(), false,
                    "Event default cancelable");
                test.equal(event.defaultPrevented(), false,
                    "Event default is not prevented");


            }

        ],

        "behavior": [

            function (test) {
                test.title("Event behaviors");
                var scope = {},
                    event = new gpf.events.Event("test", {
                    param1: "first",
                    param2: true,
                    param3: 0
                }, true, scope);
                test.equal(event.type(), "test", "Event type");
                test.equal(event.get("param1"), "first", "First parameter");
                test.equal(event.get("param2"), true, "Second parameter");
                test.equal(event.get("param3"), 0, "Third parameter");
                test.equal(event.scope(), scope, "Event scope");
                test.equal(event.cancelable(), true,
                    "Event is cancelable");
                test.equal(event.defaultPrevented(), false,
                    "Event default is not prevented");
                test.log("Prevent default");
                event.preventDefault();
                test.equal(event.defaultPrevented(), true,
                    "Event default is prevented");
            }

        ],

        "target": [

            function (test) {
                test.title("Testing Target base class no predefined events");
                var scope1 = {},
                    scope2 = {},
                    target = new gpf.events.Target(),
                    event = new gpf.events.Event("test", {
                        param1: "first",
                        param2: true,
                        param3: 0
                    }, true, scope1);
                target.addEventListener("test", function (event) {
                    test.equal(this, scope2, "Callback scope");
                    test.equal(event.type(), "test", "Event type");
                    test.equal(event.get("param1"), "first", "First parameter");
                    test.equal(event.get("param2"), true, "Second parameter");
                    test.equal(event.get("param3"), 0, "Third parameter");
                    test.equal(event.scope(), scope1, "Event scope");
                    test.done();
                }, scope2, false);
                test.wait(1);
                event.fire(target);
            },

            function (test) {
                test.title("Testing Target base class with predefined events");
                var target = new gpf.events.Target(["test"]),
                    event = new gpf.events.Event("test", {
                        param1: "first",
                        param2: true,
                        param3: 0
                    }, true);
                target.onTest(function (event) {
                    test.equal(event.type(), "test", "Event type");
                    test.log("Stopping propagation");
                    event.stopPropagation();
                    test.done();
                });
                target.addEventListener("test", function () {
                    test.assert(false, "Should never be called");
                });
                test.wait(1);
                event.fire(target);
            }

        ],

        "fire": [

            function (test) {
                test.title("Fire on a target");
                var target = new gpf.events.Target(["test"]);
                target.onTest(function (event) {
                    test.equal(event.type(), "test", "Event type");
                    test.done();
                });
                test.wait(1);
                gpf.events.fire("test", target);
            },

            function (test) {
                test.title("Fire on a Callback");
                var callback = new gpf.Callback(function (event) {
                    test.equal(event.type(), "test", "Event type");
                    test.done();
                });
                test.wait(1);
                gpf.events.fire("test", callback);
            },

            function (test) {
                test.title("Fire on a Function");
                test.wait(1);
                gpf.events.fire("test", function (event) {
                    test.equal(event.type(), "test", "Event type");
                    test.done();
                });
            },

            function (test) {
                test.title("Fire on a Object");
                test.wait(1);
                gpf.events.fire("test", {

                    test: function (event) {
                        test.equal(event.type(), "test", "Event type");
                        test.done();
                    }

                });
            }
        ]

    });

})(); /* End of privacy scope */