/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
"use strict";
/*global _gpfExtend*/ // gpf.extend
/*global _gpfValues*/ // Dictionary of value converters
/*#endif*/

    var
        _z = function (x) {
            if (10 > x) {
                return "0" + x;
            } else {
                return x;
            }
        }
        ;

    _gpfExtend(gpf, {

        "[dateToComparableFormat]": [
            gpf.$ClassExtension(Date, "toComparableFormat")
        ],

        /**
         * Converts the date into a string that can be compared with another
         * date
         *
         * @param {Date} that
         * @param {Boolean} [includeTime=true] includeTime
         * @return {String}
         */
        dateToComparableFormat: function (that, includeTime) {
            if (undefined === includeTime) {
                includeTime = true;
            }
            var
                result = [
                    that.getFullYear(), "-", _z(that.getMonth() + 1), "-",
                    _z(that.getDate())
                ];
            if (includeTime) {
                result.push(" ", _z(that.getHours()), ":",
                    _z(that.getMinutes()), ":", _z(that.getSeconds()));
            }
            return result.join("");
        },

        "[dateFromComparableFormat]": [gpf.$ClassExtension(String)],
        /**
         * Converts a string into a Date using the format used inside the
         * function dateToComparableFormat
         *
         * @param {String} that
         * @return {Date}
         */
        dateFromComparableFormat: function (that) {
            var
                date = new Date();
            date.setFullYear(parseInt(that.substr(0, 4), 10),
                parseInt(that.substr(5, 2), 10) - 1,
                parseInt(that.substr(8, 2), 10));
            if (10 < that.length) {
                date.setHours(parseInt(that.substr(11, 2), 10),
                    parseInt(that.substr(14, 2), 10),
                    parseInt(that.substr(17, 2), 10), 0);
            } else {
                date.setHours(0, 0, 0, 0);
            }
            return date;
        }

    });

    var _gpfValuesString = _gpfValues.string;
    _gpfValues.string = function (value, valueType, defaultValue) {
        if (value instanceof Date) {
            return gpf.dateToComparableFormat(value);
        }
        return _gpfValuesString(value, valueType, defaultValue);
    };

    var _gpfValuesObject = _gpfValues.object;
    _gpfValues.object = function (value, valueType, defaultValue) {
        if (defaultValue instanceof Date && "string" === valueType) {
            return gpf.dateFromComparableFormat(value);
        }
        return _gpfValuesObject(value, valueType, defaultValue);
    };

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/