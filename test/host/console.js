(function () {
    "use strict";

    /**
     * Simulate console object to generate exceptions when the output is not
     * expected. Relies on GPF.
     */

    var consoleMethods = {},
        member,
        expected = [];

    /**
     * Generates the log, warn & error methods substituted on console
     *
     * @param {String} name
     * @returns {Function}
     */
    function genMember(name) {
        return function (text) {
            var
                expectedName,
                expectedText,
                expectedOutput;

            if (!text || -1 < text.indexOf("\x1B")) {
                // Escape sequence used, must be a mocha output
                consoleMethods[name].apply(console, arguments);
                return;
            }

            if (0 !== expected.length) {
                expectedName = expected.shift();
                expectedText = expected.shift();
                expectedOutput = expected.shift();
            }
            if (expectedName !== name
                || expectedText !== text) {
                throw {
                    message: "Unexpected use of console." + name
                };
            }
            if (expectedOutput) {
                consoleMethods[name].apply(console, arguments);
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

    /**
     *
     * @param {String} method method that will be called (log, warn or error)
     * @param {String} text expected text
     * @param {Boolean} [outputs=false] outputs Outputs the text
     */
    console.expects = function (method, text, outputs) {
        expected.push(method, text, outputs === true);
    };

}());