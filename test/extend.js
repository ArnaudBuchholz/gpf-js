"use strict";

describe("extend", function () {

    // Global declarations
    var
        string = "Hello World!",
        object = {
            "number": 1,
            "string": string,
            "null": null,
            "object": {member: "value"},
            "function": function () {
                return string;
            }
        },
        objectMembers = "number,string,null,object,function",
        objectMembersNoNull = "number,string,object,function";

    describe("gpf.extend", function () {

        it("extends objects members", function () {
            var result = {
                    "number": 0,
                    "string": 0,
                    "object": 0,
                    "function": 0
                },
                members = [],
                newResult = gpf.extend(result, object);
            assert(result === newResult); // Same object returned
            gpf.forEach(object, function (value, name) {
                if (value === result[name]) {
                    members.push(name);
                }
            });
            members = members.join(",");
            assert(members === objectMembers);
        });

        it("submits overwrite to a function", function () {
            var result = {
                    "number": 0,
                    "string": 0,
                    "object": 0,
                    "function": 0
                },
                members = [];
            gpf.extend(result, object, function (/*obj, member*/) {
                members.push(arguments[1]);
            });
            members = members.join(",");
            assert(members === objectMembersNoNull);
        });

        it("provides to the overwrite function all values", function () {
            var result = {
                    "number": 0,
                    "string": 0,
                    "null": 5,
                    "object": 0,
                    "function": 0
                },
                members = [];
            gpf.extend(result, object, function (obj, member, newValue) {
                if (0 === obj[member]) {
                    obj[member] = newValue;
                    members.push(member);
                }
            });
            members = members.join(",");
            assert(members === objectMembersNoNull);
        });

    });

});
