/**
 * @file Object methods polyfill
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfInstallCompatibility*/ // Define and install compatible methods
/*#endif*/

/*eslint-disable no-proto*/ // Used for compatibility reasons
/*jshint -W103*/

_gpfInstallCompatibility("Object", {
    on: Object,

    statics: {

        // Introduced with JavaScript 1.8.5
        create: (function () {
            function Temp () {
            }

            return function (O) {
                Temp.prototype = O;
                var obj = new Temp();
                Temp.prototype = null;
                /* istanbul ignore if */ // NodeJS implements __proto__
                if (!obj.__proto__) {
                    obj.__proto__ = O;
                }
                return obj;
            };
        }()),

        // Introduced with JavaScript 1.8.5
        getPrototypeOf: function (object) {
            /* istanbul ignore else */ // NodeJS implements __proto__
            if (object.__proto__) {
                return object.__proto__;
            }
            /* istanbul ignore next */ // NodeJS implements __proto__
            // May break if the constructor has been tampered with
            return object.constructor.prototype;
        },

        // Introduced with JavaScript 1.8.5
        keys: function (object) {
            var result = [],
                key;
            for (key in object) {
                if (object.hasOwnProperty(key)) {
                    result.push(key);
                }
            }
            return result;
        },

        // Introduced with JavaScript 1.8.5
        values: function (object) {
            var result = [],
                key;
            for (key in object) {
                if (object.hasOwnProperty(key)) {
                    result.push(object[key]);
                }
            }
            return result;
        }

    }

});
