"use strict";

describe("sort", function () {

    var array = [{id: 0, num: 5, str: "e"},
                 {id: 1, num: 1, str: "b"},
                 {id: 2, num: 4, str: "a"},
                 {id: 3, num: 2, str: "d"},
                 {id: 4, num: 3, str: "c"}];

    function checkSortingResult (result, ids) {
        assert(result.every(function (item, index) {
            return item.id === ids[index];
        }));
    }

    describe("gpf.createSortFunction", function () {

        [{
            label: "sort on numeric values (ascending)",
            sort: [{
                num: true
            }],
            expected: [1, 3, 4, 2, 0]
        }, {
            label: "sort on string values (descending)",
            sort: [{
                str: false
            }],
            expected: [1, 3, 4, 2, 0]


        }].forEach(function (testCase) {

            it(testCase.label, function () {
                checkSortingResult(array.sort(gpf.createSortFunction(testCase.sort)), testCase.expected);
            });

        });

    });

});
