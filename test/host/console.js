/*eslint strict: [2, "function"]*/ // IIFE form
(function () {
    "use strict";
    /*global console: true*/

    /**
     * Simulate console object to generate exceptions when the output is not expected.
     */

    var memberList = ["log", "warn", "error"],
        consoleMethods = {},
        expected = [];

    /**
     * Generates the log, warn & error methods substituted on console
     *
     * @param {String} name "log", "warn" and "error"
     * @return {Function} Wrapper securing console method
     */
    function genMember (name) {
        function _process (text) {
            var
                expectedName,
                expectedText,
                expectedOutput,
                matchingText;
            if (0 !== expected.length) {
                expectedName = expected.shift();
                expectedText = expected.shift();
                expectedOutput = expected.shift();
            }
            if (expectedText instanceof RegExp) {
                expectedText.lastIndex = 0;
                matchingText = null !== expectedText.exec(text);
            } else {
                matchingText = expectedText === text;
            }
            if (expectedName !== name || !matchingText) {
                var error = new Error("Unexpected use of console." + name);
                error.text = text;
                throw error;
            }
            if (expectedOutput) {
                consoleMethods[name].apply(console, arguments);
            }
        }
        return function (text) {
            if (!text || -1 < text.indexOf("\x1B")) {
                // Escape sequence used, must be a mocha output
                consoleMethods[name].apply(console, arguments);
                return;
            }
            _process(text);
        };
    }

    if (undefined === consoleMethods.log) {
        memberList.forEach(function (member) {
            consoleMethods[member] = console[member];
            console[member] = genMember(member);
        });
    }

    /**
     * Way to prevent failure of console usage
     *
     * @param {String} method method that will be called (log, warn or error)
     * @param {String} text expected text
     * @param {Boolean} [outputs=false] outputs Outputs the text
     */
    console.expects = function (method, text, outputs) {
        expected.push(method, text, outputs === true);
    };

    /**
     * Restore console methods
     */
    console.restore = function () {
        if (undefined !== consoleMethods.log) {
            memberList.forEach(function (member) {
                console[member] = consoleMethods[member];
            });
            consoleMethods = {};
        }
    };

}());
