"use strict";

var array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

module.exports = {

    "Using forEach": function () {
        var result = 0;
        array.forEach(function (value, index) {
            result += value * index;
        });
        return result;
    },

    "Using for(;;)": function () {
        var result = 0;
        var _arrayLen = array.length;
        for (var index = 0; index < _arrayLen; ++index) {
            result += array[index] * index;
        }
        return result;
    }

};
