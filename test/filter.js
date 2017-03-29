"use strict";

describe("sort", function () {

    var array = [{id: 0, num: 5, str: "e"},
        {id: 1, num: 1, str: "b"},
        {id: 2, num: 4, str: "a"},
        {id: 3, num: 2, str: "d"},
        {id: 4, num: 3, str: "c"}];

    function checkFilteringResult (result, ids) {
        assert(result.length === ids.length);
        assert(result.every(function (item, index) {
            return item.id === ids[index];
        }));
    }

    describe("gpf.createFilterFunction", function () {

        [{
            label: "filter on numeric values",
            filter: {
                num: {eq: 4}
            },
            expected: []

        }].forEach(function (testCase) {

            it(testCase.label, function () {
                checkFilteringResult(array.sort(gpf.createFilterFunction(testCase.filter)), testCase.expected);
            });

        });

    });

});
