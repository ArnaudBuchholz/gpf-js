/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
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

    gpf.extend(gpf, {

        "[dateToComparableFormat]": [
            gpf.$ClassExtension(Date, "toComparableFormat")
        ],

        /**
         * Converts the date into a string that can be compared with another
         * date
         *
         * @param {Date} that
         * @param {boolean} [includeTime=true] includeTime
         * @return {string}
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
         * @param {string} that
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

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/