/*#ifndef(UMD)*/
"use strict";
/*#endif*/

if (undefined === Array.prototype.indexOf) {
    // Introduced with JavaScript 1.5
    Array.prototype.indexOf = function (value) {
        var idx = this.length;
        while (idx--) {
            if (this[idx] === value) {
                return idx;
            }
        }
        return -1;
    };
}

if (undefined === Object.defineProperty) {

    /**
     * If possible, defines a read-only property
     *
     * @param {Object} obj
     * @param {String} name
     * @param {*} value
     * @return {Object}
     * @chainable
     */
    gpf.setReadOnlyProperty = function (obj, name, value) {
        obj[name] = value;
        return obj;
    };

} else {

    gpf.setReadOnlyProperty = function (obj, name, value) {
        Object.defineProperty(obj, name, {
            enumerable: true,
            configurable: false,
            writable: false,
            value: value
        });
        return obj;
    };

}
