/*#ifndef(UMD)*/
"use strict";
/*global _gpfCompatibility*/ // Polyfills for missing 'standard' methods
/*#endif*/

/*eslint-disable no-proto*/ // Used for compatibility reasons
/*jshint -W103*/

_gpfCompatibility.Object = {
    on: Object,

    statics: {

        create: (function () {
            function Temp () {
            }

            return function (O) {
                Temp.prototype = O;
                var obj = new Temp();
                Temp.prototype = null;
                /* istanbul ignore if */ // NodeJS does not use __proto__
                if (!obj.__proto__) {
                    obj.__proto__ = O;
                }
                return obj;
            };
        }()),

        getPrototypeOf: function (object) {
            if (object.__proto__) {
                return object.__proto__;
            }
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

};
