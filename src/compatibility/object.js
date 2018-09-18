/**
 * @file Object methods polyfill
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfCompatibilityInstallMethods*/ // Define and install compatible methods on standard objects
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*#endif*/

/*eslint-disable no-proto*/ // Used for compatibility reasons
/*jshint -W103*/

function _gpfObjectAssign (value, memberName) {
    /*jshint validthis:true*/
    this[memberName] = value; //eslint-disable-line no-invalid-this
}

_gpfCompatibilityInstallMethods("Object", {
    on: Object,

    statics: {

        // Introduced with ECMAScript 2015
        assign: function (destination, source) {
            _gpfIgnore(source);
            [].slice.call(arguments, 1).forEach(function (nthSource) {
                _gpfObjectForEach(nthSource, _gpfObjectAssign, destination);
            });
            return destination;
        },

        // Introduced with JavaScript 1.8.5
        create: (function () {
            function Proto (Constructor) {
                this.constructor = Constructor;
                this.__proto__ = Proto.prototype;
            }

            function Temp () {
            }

            return function (O) {
                Proto.prototype = O;
                Temp.prototype = new Proto(Temp);
                var obj = new Temp();
                return obj;
            };
        }()),

        // Introduced with JavaScript 1.8.5
        getPrototypeOf: function (object) {
            /* istanbul ignore else */ // wscript.node.1
            if (object.__proto__) {
                return object.__proto__;
            }
            // May break if the constructor has been tampered with
            /* istanbul ignore next */ // wscript.node.1
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
