"use strict";

var properties = {
    "0": 0,
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9
};

function _gpfObjectForEachOwnProperty (object, callback, thisArg) {
    for (var property in object) {
        if (Object.prototype.hasOwnProperty.call(object, property)) {
            callback.call(thisArg, object[property], property, object);
        }
    }
}

module.exports = {

    "Using forEach": function () {
        var result = 0;
        _gpfObjectForEachOwnProperty(properties, function (value, key) {
            result += value * parseInt(key, 10);
        });
        return result;
    },

    "Using for(in)": function () {
        var result = 0;
        for (var property in properties) {
            if (Object.prototype.hasOwnProperty.call(properties, property)) {
                result += properties[property] * parseInt(property, 10);
            }
        }
        return result;
    }

};
