"use strict";

/*global atob, btoa*/

describe("compatibility/base64", function () {

    var conversions = {
        "Hello": "SGVsbG8=",
        "Hello ": "SGVsbG8g",
        "Hello World !": "SGVsbG8gV29ybGQgIQ==",
        "!@#$%?&*()": "IUAjJCU/JiooKQ=="
    };

    function generateScenario (methods) {

        return function () {

            describe("atob", function () {

                var atob = methods.atob;

                Object.keys(conversions).forEach(function (stringToEncode) {
                    var encodedString = conversions[stringToEncode];
                    it("turns " + JSON.stringify(encodedString)
                        + " into " + JSON.stringify(stringToEncode), function () {
                        assert(atob(encodedString) === stringToEncode);
                    });
                });

                it("rejects strings with invalid characters", function () {
                    var exceptionCaught;
                    try {
                        atob("<");
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught);
                });

            });

            describe("btoa", function () {

                var btoa = methods.btoa;

                Object.keys(conversions).forEach(function (stringToEncode) {
                    var encodedString = conversions[stringToEncode];
                    it("turns " + JSON.stringify(stringToEncode)
                        + " into " + JSON.stringify(encodedString), function () {
                        assert(btoa(stringToEncode) === encodedString);
                    });
                });

                it("rejects strings with non latin characters", function () {
                    var exceptionCaught;
                    try {
                        btoa("\u2665"); // hearts
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught);
                });

            });

        };

    }

    describe("exposed API", generateScenario({
        atob: atob,
        btoa: btoa
    }));

    if (gpf.internals && atob !== gpf.internals._gpfAtob) {

        describe("(internal)", generateScenario({
            atob: gpf.internals._gpfAtob,
            btoa: gpf.internals._gpfBtoa
        }));

    }

});
