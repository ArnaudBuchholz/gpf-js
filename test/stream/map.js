"use strict";

describe("stream/map", function () {

    var array = [
        {id: 0},
        {id: 1},
        {id: 2},
        {id: 3},
        {id: 4}
    ];

    function checkMappingResult (result, expected) {
        assert(result.length === expected.length);
        assert(result.every(function (item, index) {
            return item === expected[index];
        }));
    }

    function test (mappingFunc, expected, done) {
        var readable = new gpf.stream.ReadableArray(array),
            map = new gpf.stream.Map(mappingFunc),
            output = new gpf.stream.WritableArray();
        gpf.stream.pipe(readable, map, output)
            .then(function () {
                checkMappingResult(output.toArray(), expected);
                done();
            })["catch"](done);
    }

    function _identity (x) {
        return x;
    }

    describe("gpf.stream.Map", function () {

        it("forwards errors", function (done) {
            var readable = new gpf.stream.ReadableArray(array),
                map = new gpf.stream.Map(_identity),
                output = {
                    write: function (data) {
                        _identity(data);
                        return Promise.reject("KO");
                    }
                };
            gpf.stream.pipe(readable, map, output)
                .then(function () {
                    throw new Error("Not expected");
                }, function (reason) {
                    assert(reason === "KO");
                    done();
                })["catch"](done);
        });

        it("maps data - identity", function (done) {
            test(_identity, array, done);
        });

        it("filters data - one substitution", function (done) {
            var uniqueObject = {};
            function oneSubstitution (data) {
                if (data.id === 2) {
                    return uniqueObject;
                }
                return data;
            }
            test(oneSubstitution, array.map(oneSubstitution), done);
        });

        it("filters data - several substitutions", function (done) {
            test(function (data) {
                return data.id;
            }, [0, 1, 2, 3, 4], done);
        });

    });

});
