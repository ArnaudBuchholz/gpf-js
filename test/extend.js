"use strict";

describe("extend", function () {

    describe("gpf.extend", function () {

        it("extends objects members", function () {
            var destination = {
                    "member1": "member1",
                    "member2": 2
                },
                source = {
                    "newMember": true
                },
                result = gpf.extend(destination, source);
            assert(result === destination); // Same object reference is returned
            assert(result.member1 === "member1"); // Existing members are preserved
            assert(result.member2 === 2); // Existing members are preserved
            assert(result.newMember === true); // New member added
            assert(source.newMember === true); // Source is not altered
        });

        it("overwrites existing members", function () {
            var destination = {
                    "member1": "member1"
                },
                source = {
                    "member1": false
                },
                result = gpf.extend(destination, source);
            assert(result.member1 === false); // Overwritten
        });

        it("supports more than one source parameter", function () {
            var destination = {
                    "member1": "member1",
                    "member2": 2
                },
                result = gpf.extend(destination, {
                    "source1": 1,
                    "member1": "member1.1"
                }, {
                    "source2": 2,
                    "member1": "member1.2"
                });
            assert(result.member1 === "member1.2"); // Last one wins
            assert(result.member2 === 2); // Existing members are preserved
            assert(result.source1 === 1); // Processed first source
            assert(result.source2 === 2); // Processed second source
        });

    });

});
