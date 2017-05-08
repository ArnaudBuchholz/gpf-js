"use strict";

describe("literal", function () {

    describe("gpf.isLiteralObject", function () {

        function A () {}

        [{
            value: {},
            result: true
        }, {
            value: {
                member: "a"
            },
            result: true
        }, {
            /*jshint -W010*/
            value: new Object(), //eslint-disable-line no-new-object
            result: true
        }, {
            value: null
        }, {
            value: undefined
        }, {
            value: new A(),
            label: "new A()"
        }, {
            value: []
        }, {
            value: new Date(),
            label: "new Date()"
        }, {
            value: true

        }].forEach(function (testCase) {
            var label = testCase.label || JSON.stringify(testCase.value),
                expected = testCase.result === true,
                verb = {
                    "true": "recognizes",
                    "false": "rejects"
                }[expected];
            it(verb + " " + label, function () {
                assert(expected === gpf.isLiteralObject(testCase.value));
            });
        });

    });

});
