"use strict";

describe("extend", function () {

    var
        referenceString = "Hello World!",
        referenceObject = {
            "number": 1,
            "string": referenceString,
            "null": null,
            "referenceObject": {member: "value"},
            "function": function () {
                return referenceString;
            }
        },
        referenceObjectMembers = "number,string,null,referenceObject,function",
        referenceObjectNoNull = "number,string,referenceObject,function";

    describe("gpf.extend", function () {

        it("extends objects members", function () {
            var result = {
                    "number": 0,
                    "function": 0
                },
                members = [],
                newResult = gpf.extend(result, referenceObject);
            assert(result === newResult); // Same object reference is returned
            gpf.forEach(referenceObject, function (value, name) {
                if (value === result[name]) {
                    members.push(name);
                }
            });
            members = members.join(",");
            assert(members === referenceObjectMembers);
        });

        it("submits overwrite to a function", function () {
            var result = {
                    "number": 0,
                    "string": 0,
                    "referenceObject": 0,
                    "function": 0
                },
                members = [];
            gpf.extend(result, referenceObject, function (obj, member/*, value*/) {
                members.push(member);
                // No result
            });
            members = members.join(",");
            assert(members === referenceObjectNoNull);
        });

        it("provides to the overwrite function all values", function () {
            var result = {
                    "number": 0,
                    "string": 0,
                    "null": 5,
                    "referenceObject": 0,
                    "function": 0
                },
                members = [];
            gpf.extend(result, referenceObject, function (obj, member/*, value*/) {
                if (0 === obj[member]) {
                    members.push(member);
                    return true;
                }
            });
            members = members.join(",");
            assert(members === referenceObjectNoNull);
        });

    });

});
