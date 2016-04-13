"use strict";

describe("string/capitalize", function () {

    if (gpf.internals) {

        describe("(internal) _gpfStringCapitalize", function () {
            var _gpfStringCapitalize = gpf.internals._gpfStringCapitalize;

            it("does nothing on empty string", function () {
                assert(_gpfStringCapitalize("") === "");
            });

            it("uppercases the first letter", function () {
                assert(_gpfStringCapitalize("word") === "Word");
                assert(_gpfStringCapitalize("two words") === "Two words");
                assert(_gpfStringCapitalize("Two words") === "Two words");
            });

            it("also handles accents", function () {
                assert(_gpfStringCapitalize("\u00E9ric") === "\u00C9ric");
            });

        });

    }

});
