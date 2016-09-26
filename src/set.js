/**
 * @file Sets helpers
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAssert*/ // Assertion method
/*global _gpfExtend*/ // gpf.extend
/*#endif*/

//region test

function _gpfArrayTest (array, value) {
    var index = array.indexOf(value);
    if (-1 < index) {
        return index;
    }
}

function _gpfObjectTest (object, value) {
    var values = Object.values(object),
        index = values.indexOf(value);
    if (-1 < index) {
        return Object.keys(object)[index];
    }
}

function _gpfSetTest (set, value) {
    if (set instanceof Array) {
        return _gpfArrayTest(set, value);
    }
    return _gpfObjectTest(set, value);
}

//endregion

//region clear

function _gpfArrayClear (array, value) {
    var index = array.indexOf(value);
    if (-1 < index) {
        array.splice(index, 1);
    }
}

function _gpfObjectClear (object, value) {
    var values = Object.values(object),
        index = values.indexOf(value),
        property;
    if (-1 < index) {
        property = Object.keys(object)[index];
        delete object[property];
    }
}

function _gpfSetClear (set, value) {
    if (set instanceof Array) {
        _gpfArrayClear(set, value);
    } else {
        _gpfObjectClear(set, value);
    }
    return set;
}

//endregion

_gpfExtend(gpf, {

    /*
     * Find the first member of dictionary which value equals to value.
     *
     * @param {Object/Array} set
     * @param {*} value
     * @return {String/number/undefined} undefined if not found
     */
    test: _gpfSetTest,

    /*
     * Inserts the value in the array if not already present.
     *
     * @param {Array} array
     * @param {*} value
     * @return {Array}
     * @chainable
     */
    set: function (array, value) {
        _gpfAssert(array instanceof Array, "gpf.set must be used with an Array");
        if (undefined === _gpfArrayTest(array, value)) {
            array.push(value);
        }
        return array;
    },

    /*
     * Removes the member of 'dictionary' which value equals 'value'.
     * NOTE: that the object is modified.
     *
     * @param {Object/array} dictionary
     * @param {*} value
     * @return {Object/array} dictionary
     * @chainable
     */
    clear: _gpfSetClear

});
