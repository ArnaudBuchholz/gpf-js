/**
 * @file Value converter
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfIsISO8601String*/ // Check if the string is an ISO 8601 representation of a date
/*exported _gpfNodeBuffer2JsArray*/ // Converts a NodeJS buffer into an int array
/*#endif*/

var // to boolean converters
    _gpfBooleanValues = {
        number: function (value) {
            return 0 !== value;
        },

        string: function (value) {
            if (-1 !== ["yes", "true"].indexOf(value)) {
                return true;
            }
            return 0 !== parseInt(value, 10);
        }
    },

    /**
     * gpf.value handlers per type.
     * Each handler signature is:
     * - {*} value the value to convert
     * - {String} valueType typeof value
     * - {*} defaultValue the expected default value if not convertible
     *
     * @type {Object}
     */
    _gpfValues = {
        "boolean": function (value, valueType, defaultValue) {
            _gpfIgnore(defaultValue);
            var booleanConverter = _gpfBooleanValues[valueType];
            if (booleanConverter) {
                return booleanConverter(value);
            }
        },

        number:  function (value, valueType, defaultValue) {
            _gpfIgnore(defaultValue);
            if ("string" === valueType) {
                return parseFloat(value);
            }
        },

        string: function (value, valueType, defaultValue) {
            if (value instanceof Date) {
                return value.toISOString();
            }
            _gpfIgnore(valueType, defaultValue);
            return value.toString();
        },

        object: function (value, valueType, defaultValue) {
            if (defaultValue instanceof Date && "string" === valueType && _gpfIsISO8601String(value)) {
                return new Date(value);
            }
        }
    };

/*
 * Converts the provided value to match the expectedType.
 * If not specified or impossible to do so, defaultValue is returned.
 * When expectedType is not provided, it is deduced from defaultValue.
 *
 * @param {*} value
 * @param {*} default value
 * @param {String} [expectedType=typeof defaultValue] expected type
 * @return {*}
 */
function _gpfValue (value, defaultValue, expectedType) {
    var valueType = typeof value,
        result;
    if (!expectedType) {
        expectedType = typeof defaultValue;
    }
    if (expectedType === valueType) {
        return value;
    }
    if ("undefined" === valueType) {
        return defaultValue;
    }
    result = _gpfValues[expectedType](value, valueType, defaultValue);
    if (undefined === result) {
        return defaultValue;
    }
    return result;
}

// @inheritdoc _gpfValue
gpf.value = _gpfValue;
