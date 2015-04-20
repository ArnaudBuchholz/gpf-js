(function () {
    "use strict";

    /**
     * Simulate console object to generate exceptions when the output is not
     * expected. Relies on GPF.
     */

    var realConsole = gpf.context().console,
        member,
        expected = [],
        newConsole = {};

    function genMember(name) {
        return function (text) {
            if (0 === expected.length
                || expected[0] !== name
                || expected[1] !== text) {
                throw {
                    message: "Unexpected use of console." + name
                };
            }
            expected.shift();
            expected.shift();
            realConsole[name].apply(realConsole, arguments);
        };
    }

    for (member in realConsole) {
        if (realConsole.hasOwnProperty(member)) {
            newConsole[member] = genMember(member);
        }
    }

    realConsole.expect = function (method, text) {
        expected.push(method, text);
    };

    module.exports = function (enable) {
        if (enable) {
            gpf.context().console = newConsole;
        } else {
            gpf.context().console = realConsole;
        }
    };

}());


