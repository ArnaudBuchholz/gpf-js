"use strict";

var that = {
    first: 1,
    second: 2
};

function add (last) {
    return this.first + this.second + last;
}

function bind (me, thisArg) {
    var prependArgs = [].slice.call(arguments, 1);
    return function () {
        var args = [].slice.call(arguments);
        return me.apply(thisArg, prependArgs.concat(args));
    };
}

function simpleBind (me, thisArg) {
    return function () {
        return me.apply(thisArg, arguments);
    };
}

var nativeBound = add.bind(that, 3);
var compatibleBound = bind(add, that, 3);
var compatibleSimpleBound = simpleBind(add, that, 3);

module.exports = {

    "Native bind": function () {
        return nativeBound() === 6;
    },

    "Compatible bind": function () {
        return compatibleBound() === 6;
    },

    "Compatible simple bind": function () {
        return compatibleSimpleBound() === 6;
    }

};
