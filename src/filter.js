/**
 * @file Filtering helper
 * @since 0.1.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_START*/ // 0
/*global _gpfFunc*/ // Create a new function using the source
/*#endif*/

/**
 * Filtering function
 *
 * @callback gpf.typedef.filterFunc
 *
 * @param {*} data Data to filter
 * @return {Boolean} truthy / falsy value indicating if the data matches the filter
 *
 * @since 0.2.4
 */

/**
 * Filter property read specification
 *
 * @typedef gpf.typedef.filterProperty
 * @property {String} property Property name to read
 * @see gpf.createFilterFunction
 * @since 0.1.9
 */

/**
 * Filter equal specification
 *
 * @typedef gpf.typedef.filterEq
 * @property {gpf.typedef.filterItem[]} eq List of items to compare,
 * returns true if all values are strictly equal
 * @see gpf.createFilterFunction
 * @since 0.1.9
 */

/**
 * Filter not equal specification
 *
 * @typedef gpf.typedef.filterNe
 * @property {gpf.typedef.filterItem[]} eq List of items to compare,
 * returns true if all values are strictly different
 * @see gpf.createFilterFunction
 * @since 0.1.9
 */

/**
 * Filter lower than specification
 *
 * @typedef gpf.typedef.filterLt
 * @property {gpf.typedef.filterItem[]} lt List of items to compare
 * @see gpf.createFilterFunction
 * @since 0.1.9
 */

/**
 * Filter lower than or equal specification
 *
 * @typedef gpf.typedef.filterLte
 * @property {gpf.typedef.filterItem[]} lte List of items to compare
 * @see gpf.createFilterFunction
 * @since 0.1.9
 */

/**
 * Filter greater than specification
 *
 * @typedef gpf.typedef.filterGt
 * @property {gpf.typedef.filterItem[]} gt List of items to compare
 * @see gpf.createFilterFunction
 * @since 0.1.9
 */

/**
 * Filter greater than or equal specification
 *
 * @typedef gpf.typedef.filterGte
 * @property {gpf.typedef.filterItem[]} gte List of items to compare
 * @see gpf.createFilterFunction
 * @since 0.1.9
 */

/**
 * Filter not specification
 *
 * @typedef gpf.typedef.filterNot
 * @property {gpf.typedef.filterItem} not Item to negate,
 * returns true if the item is falsy, false otherwise
 * @see gpf.createFilterFunction
 * @since 0.1.9
 */

/**
 * Filter like specification
 *
 * @typedef gpf.typedef.filterLike
 * @property {gpf.typedef.filterItem} like Item
 * @property {String} regexp Regular expression specification
 * @property {Number} [group] If the regular expression contains capturing group, this members can be used to return
 * the group by index (1-based)
 * @see gpf.createFilterFunction
 * @since 0.1.9
 */

/**
 * Filter OR specification
 *
 * @typedef gpf.typedef.filterOr
 * @property {gpf.typedef.filterItem[]} or List of items to or,
 * returns the first truthy value or the last falsy value
 * @see gpf.createFilterFunction
 * @since 0.1.9
 */

/**
 * Filter AND specification
 *
 * @typedef gpf.typedef.filterAnd
 * @property {gpf.typedef.filterItem[]} and List of items to and,
 * returns the first falsy value or the last truthy value
 * @see gpf.createFilterFunction
 * @since 0.1.9
 */

/**
 * Filter specification
 *
 * @typedef {
 *  gpf.typedef.filterProperty
 *  | gpf.typedef.filterEq
 *  | gpf.typedef.filterNe
 *  | gpf.typedef.filterLt
 *  | gpf.typedef.filterLte
 *  | gpf.typedef.filterGt
 *  | gpf.typedef.filterGte
 *  | gpf.typedef.filterNot
 *  | gpf.typedef.filterLike
 *  | gpf.typedef.filterOr
 *  | gpf.typedef.filterAnd
 * } gpf.typedef.filterItem
 * @see gpf.createFilterFunction
 * @since 0.1.9
 */

// Avoid use before declaration
var _gpfCreateFilterConvert;

function _gpfCreateFilterArrayConverter (member, operator) {
    return function (specification) {
        return "(" + specification[member].map(_gpfCreateFilterConvert).join(operator) + ")";
    };
}

function _gpfCreateFilterLike (specification) {
    return "/" + specification.regexp + "/.exec("
        + _gpfCreateFilterConvert(specification.like) + ")";
}

var // List of converters
    _gpfCreateFilterConverters = {

        property: function (specification) {
            return "i." + specification.property;
        },

        eq: _gpfCreateFilterArrayConverter("eq", "==="),
        ne: _gpfCreateFilterArrayConverter("ne", "!=="),
        lt: _gpfCreateFilterArrayConverter("lt", "<"),
        lte: _gpfCreateFilterArrayConverter("lte", "<="),
        gt: _gpfCreateFilterArrayConverter("gt", ">"),
        gte: _gpfCreateFilterArrayConverter("gte", ">="),

        not: function (specification) {
            return "!" + _gpfCreateFilterConvert(specification.not);
        },

        like: function (specification) {
            var like = _gpfCreateFilterLike(specification);
            if (specification.group) {
                return "(" + like + "||[])[" + specification.group + "]";
            }
            return like;
        },

        or: _gpfCreateFilterArrayConverter("or", "||"),

        and: _gpfCreateFilterArrayConverter("and", "&&"),

        undefined: function (specification) {
            return JSON.stringify(specification);
        }
    },

    _gpfCreateFilterTypes = Object.keys(_gpfCreateFilterConverters);

function _gpfCreateFilterGetType (specification) {
    if (typeof specification === "object") {
        return Object.keys(specification).filter(function (property) {
            return _gpfCreateFilterTypes.includes(property);
        })[_GPF_START];
    }
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
 * Create a filtering function based on the given specification.
 *
 * @param {gpf.typedef.filterItem} specification Filter specification
 * @return {gpf.typedef.filterFunc} Function that takes an object and return a truthy / falsy value indicating if the
 * object matches the filter
 * @since 0.1.9
 */
gpf.createFilterFunction = function (specification) {
    return _gpfFunc(["i"], _gpfCreateFilterBody(specification));
};
