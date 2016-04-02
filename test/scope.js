"use strict";

describe("scope", function () {

    if (gpf.internals) {

        describe("_gpfResolveScope", function () {

            var _gpfResolveScope = gpf.internals._gpfResolveScope;

            [
                null,
                "Hello World!",
                42,
                false,
                true
            ].forEach(function (value) {
                var label;
                if (null === value) {
                    label = "null";
                } else {
                    label = typeof value + " (" + value + ")";
                }
                it("generates a valid scope - " + label, function () {
                    assert(gpf.context() === _gpfResolveScope(value));
                });
            });

            it("keeps any valid scope", function () {
                var obj = {};
                assert(obj === _gpfResolveScope(obj));
            });

        });

    }

});
