"use strict";
/*global describe, it, assert*/

describe("compatibility", function () {

    describe("array", function () {

        it("should allow building an array with a given size", function () {
            var
                array = new Array(5),
                idx;
            assert.equal(array.length, 5, "Size of the array");
            for (idx = 0; idx < 5; ++idx) {
                assert.equal(array[idx], undefined, "Items are undefined");
            }
            assert.equal(array.join(" "), "    ", "Joining works (4 spaces)");
        });

    });

});