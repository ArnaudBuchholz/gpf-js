/**
 * @file Filtering helper
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfFunc*/ // Create a new function using the source
/*#endif*/

//region test

/**
 * Filter property read specification
 *
 * @typedef gpf.typedef.filterProperty
 * @property {String} property Property name to read
 * @see gpf.typedef.filterItem
 */

/**
 * Filter equal specification
 *
 * @typedef gpf.typedef.filterEq
 * @property {gpf.typedef.filterItem[]} eq List of items to compare,
 * returns true if all values are strictly equal
 */

/**
 * Filter not equal specification
 *
 * @typedef gpf.typedef.filterNe
 * @property {gpf.typedef.filterItem[]} eq List of items to compare,
 * returns true if all values are strictly different
 */

/**
 * Filter not specification
 *
 * @typedef gpf.typedef.filterNot
 * @property {gpf.typedef.filterItem} not Item to negate,
 * returns true if the item is falsy, false otherwise
 */

/**
 * Filter like specification
 *
 * @typedef gpf.typedef.filterLike
 * @property {gpf.typedef.filterItem} like Item
 * @property {String} regexp Regular expression specification
 */

/**
 * Filter OR specification
 *
 * @typedef gpf.typedef.filterOr
 * @property {gpf.typedef.filterItem[]} or List of items to or,
 * returns the first truthy value or the last falsy value
 */

/**
 * Filter AND specification
 *
 * @typedef gpf.typedef.filterAnd
 * @property {gpf.typedef.filterItem[]} and List of items to and,
 * returns the first falsy value or the last truthy value
 */

/**
 * Filter specification
 *
 * @typedef {
 *  gpf.typedef.filterProperty
 *  | gpf.typedef.filterEq
 *  | gpf.typedef.filterNe
 *  | gpf.typedef.filterNot
 *  | gpf.typedef.filterLike
 *  | gpf.typedef.filterOr
 *  | gpf.typedef.filterAnd
 * } gpf.typedef.filterItem
 */

// Avoid use before declaration
var _gpfCreateFilterConvert;

function _gpfCreateFilterArrayConverter (member, operator) {
    return function (specification) {
        return "(" + specification[member].map(_gpfCreateFilterConvert).join(operator) + ")";
    };
}

function _gpfCreateFilterArrayConverterWithDefault (member, operator, defaultValue) {
    return function (specification) {
        var array = specification[member];
        if (0 === array.length) {
            return defaultValue;
        }
        return "(" + array.map(_gpfCreateFilterConvert).join(operator) + ")";
    };
}

var // List of converters
    _gpfCreateFilterConverters = {

        property: function (specification) {
            return "i." + specification.property;
        },

        eq: _gpfCreateFilterArrayConverter("eq", "==="),

        ne: _gpfCreateFilterArrayConverter("ne", "!=="),

        not: function (specification) {
            return "!" + _gpfCreateFilterConvert(specification.not);
        },

        like: function (specification) {
            return "(new RegExp(" + JSON.stringify(specification.regexp) + ").exec("
                + _gpfCreateFilterConvert(specification.like) + "))";
        },

        or: _gpfCreateFilterArrayConverterWithDefault("or", "||", "false"),

        and: _gpfCreateFilterArrayConverterWithDefault("and", "&&", "true"),

        undefined: function (specification) {
            return JSON.stringify(specification);
        }
    },

    _gpfCreateFilterTypes = Object.keys(_gpfCreateFilterConverters);

function _gpfCreateFilterGetType (specification) {
    return Object.keys(specification).filter(function (property) {
        return -1 < _gpfCreateFilterTypes.indexOf(property);
    })[0];
}

_gpfCreateFilterConvert = function (specification) {
    var type = _gpfCreateFilterGetType(specification),
        converter = _gpfCreateFilterConverters[type];
    return converter(specification);
};

function _gpfCreateFilterBody (specification) {
    return "return " + _gpfCreateFilterConvert(specification);
}

/**
 * Create a sorting function based on the given specification
 *
 * @param {gpf.typedef.filterItem} specification Filter specification
 * @return {Function} Function that can filter object
 */
gpf.createFilterFunction = function (specification) {
    return _gpfFunc(["i"], _gpfCreateFilterBody(specification));
};
