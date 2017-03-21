"use strict";
/*eslint-disable no-ternary*/

var count = 0;

module.exports = {

    "if/else": function () {
        var result;
        if (++count % 2) {
            result = "1";
        } else {
            result = "2";
        }
        return result;
    },

    "?:": function () {
        return ++count % 2 ? "1" : "2";
    }

};
