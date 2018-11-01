"use strict";

describe("string/replaceex", function () {

    if (gpf.internals) {

        describe("(internal) _gpfStringReplaceEx", function () {
            var _gpfStringReplaceEx = gpf.internals._gpfStringReplaceEx;

            it("replaces strings recursively", function () {
                assert(_gpfStringReplaceEx("abc", {
                    "a": "abc",
                    "b": "dc",
                    "c": ""
                }) === "add");
            });

        });

    }

});
