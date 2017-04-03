"use strict";

describe("sort", function () {

    var array = [{id: 0, num: 5, str: "e", group: 1},
                {id: 1, num: 1, str: "b", group: 0},
                {id: 2, num: 4, str: "a", group: 1},
                {id: 3, num: 2, str: "d", group: 0},
                {id: 4, num: 3, str: "c", group: 1}];

    function checkFilteringResult (result, ids) {
        assert(result.length === ids.length);
        assert(result.every(function (item, index) {
            return item.id === ids[index];
        }));
    }

    describe("gpf.createFilterFunction", function () {

        // Simple operators
        [{
            label: "filters on numeric values",
            filter: {eq: [{property: "num"}, 1]},
            expected: [1]

        }, {
            label: "filters on own values",
            filter: {eq: [{property: "num"}, {property: "id"}]},
            expected: [1]

        }, {
            label: "filters on string values",
            filter: {
                eq: [{property: "str"}, "c"]
            },
            expected: [4]

        }, {
            label: "filters on string values (ne)",
            filter: {
                ne: [{property: "str"}, "c"]
            },
            expected: [0, 1, 2, 3]

        }, {
            label: "filters on string values (not eq)",
            filter: {
                not: {
                    eq: [{property: "str"}, "c"]
                }
            },
            expected: [0, 1, 2, 3]

        }, {
            label: "filters on string values (like)",
            filter: {
                like: {property: "str"},
                regexp: "[a|c]"
            },
            expected: [2, 4]

        // or
        }, {
            label: "filters with or (no conditions)",
            filter: {
                or: []
            },
            expected: []

        }, {
            label: "filters with or (one condition)",
            filter: {
                or: [
                    {eq: [{property: "num"}, 1]}
                ]
            },
            expected: [1]

        }, {
            label: "filters with or (two conditions)",
            filter: {
                or: [
                    {eq: [{property: "num"}, 1]},
                    {eq: [{property: "str"}, "c"]}
                ]
            },
            expected: [1, 4]

        }, {
            label: "filters with or (three conditions)",
            filter: {
                or: [
                    {eq: [{property: "num"}, 1]},
                    {eq: [{property: "str"}, "c"]},
                    {eq: [{property: "group"}, 0]}
                ]
            },
            expected: [1, 3, 4]

        // and
        }, {
            label: "filters with and (no conditions)",
            filter: {
                and: []
            },
            expected: [0, 1, 2, 3, 4]

        }, {
            label: "filters with and (one condition)",
            filter: {
                and: [
                    {eq: [{property: "group"}, 1]}
                ]
            },
            expected: [0, 2, 4]

        }, {
            label: "filters with and (two conditions)",
            filter: {
                and: [
                    {eq: [{property: "group"}, 1]},
                    {eq: [{property: "str"}, "c"]}
                ]
            },
            expected: [4]

        }, {
            label: "filters with and (three conditions)",
            filter: {
                and: [
                    {eq: [{property: "group"}, 1]},
                    {eq: [{property: "str"}, "c"]},
                    {eq: [{property: "num"}, 3]}
                ]
            },
            expected: [4]

        }].forEach(function (testCase) {

            it(testCase.label, function () {
                checkFilteringResult(array.filter(gpf.createFilterFunction(testCase.filter)), testCase.expected);
            });

        });

    });

});
