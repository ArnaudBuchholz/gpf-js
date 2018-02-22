"use strict";

describe("stream/filter", function () {

    var array = [
        {id: 0, num: 5, str: "e", group: 1, search: "first"},
        {id: 1, num: 1, str: "b", group: 0, search: "second"},
        {id: 2, num: 4, str: "a", group: 1, search: "third"},
        {id: 3, num: 2, str: "d", group: 0, search: "fourth"},
        {id: 4, num: 3, str: "c", group: 1, search: "fifth"}
    ];

    function checkFilteringResult (result, ids) {
        assert(result.length === ids.length);
        assert(result.every(function (item, index) {
            return item.id === ids[index];
        }));
    }

    describe("gpf.stream.Filter", function () {

        it("filters data", function (done) {
            var readable = new gpf.stream.ReadableArray(array),
                filter = new gpf.stream.Filter(function (data) {
                    return data.num === 1;
                }),
                output = new gpf.stream.WritableArray(array);
            gpf.stream.pipe(readable, filter, output)
                .then(function () {
                    checkFilteringResult(output.toArray(), [1]);
                    done();
                })["catch"](done);
        });

    });

});
