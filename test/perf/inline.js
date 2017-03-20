"use strict";

function mul (a, b) {
    return a * b;
}

function add (a, b) {
    return a + b;
}

module.exports = {

    "Using function call": function () {
        return mul(add(1, 2), 3);
    },

    "Inlining": function () {
        return (1 + 2) * 3;
    }

};
