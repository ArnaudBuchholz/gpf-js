"use strict";

describe("sort", function () {

    var array = [{id: 0, num: 5, str: "e", group: 1},
                 {id: 1, num: 1, str: "b", group: 0},
                 {id: 2, num: 4, str: "a", group: 1},
                 {id: 3, num: 2, str: "d", group: 0},
                 {id: 4, num: 3, str: "c", group: 1}];

    function checkSortingResult (result, ids) {
        assert(result.every(function (item, index) {
            return item.id === ids[index];
        }));
    }

    describe("gpf.createSortFunction", function () {

        [{
            label: "sort on numeric values (ascending)",
            sort: {
                property: "num"
            },
            expected: [1, 3, 4, 2, 0]
        }, {
            label: "sort on string values (descending)",
            sort: [{
                property: "str",
                type: "string",
                ascending: false
            }],
            expected: [0, 3, 4, 1, 2]
        }, {
            label: "sort on multiple values",
            sort: [{
                property: "group",
                type: "number",
                ascending: true
            }, {
                property: "num",
                ascending: false
            }],
            expected: [3, 1, 0, 2, 4]

        }].forEach(function (testCase) {

            it(testCase.label, function () {
                checkSortingResult(array.sort(gpf.createSortFunction(testCase.sort)), testCase.expected);
            });

        });

    });

});
