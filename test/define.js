"use strict";

describe("define", function () {

    describe("gpf.define", function () {

        it("accepts only one parameter", function () {
            assert("function" === typeof gpf.define);
            assert(1 === gpf.define.length);
        });

        describe("Simple class description", function () {

            var A = gpf.define({
                $class: "A",
                _member: "defaultValue",
                getMember: function () {
                    return this._member;
                }
            });

            it("");

        });

    });

});
