(function () {
    "use strict";

    /**
     * Simulate console object to generate exceptions when the output is not
     * expected. Relies on GPF.
     */

    var consoleMethods = {},
        member,
        expected = [];

    function genMember(name) {
        return function (text) {
            var
                expectedName,
                expectedText;
            consoleMethods[name].apply(console, arguments);

            if (0 !== expected.length) {
                expectedName = expected.shift();
                expectedText = expected.shift();
            }
            if (expectedName !== name
                || expectedText !== text) {
                throw {
                    message: "Unexpected use of console." + name
                };
            }
        };
    }

    for (member in console) {
        if (console.hasOwnProperty(member)
            || "function" === typeof console[member]) {
            consoleMethods[member] = console[member];
            console[member] = genMember(member);
        }
    }

    console.expects = function (method, text) {
        expected.push(method, text);
    };

}());