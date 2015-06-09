/*#ifndef(UMD)*/
"use strict";
/*global _gpfResolveScope*/ // Translate the parameter into a valid scope
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfArraySlice*/ // Shortcut on Array.prototype.slice
/*global _gpfExtend*/ // gpf.extend
/*#endif*/

var
    /**
     * @inheritdoc gpf.Callback:buildParamArray
     * @private
     */
    _gpfBuildParamArray = function (count, params) {
        var
            len,
            result,
            idx;
        if (params) {
            len = params.length;
            result = new Array(count + len);
            for (idx = 0; idx < len; ++idx) {
                result[count] = params[idx];
                ++count;
            }
        } else {
            result = new Array(count);
        }
        return result;
    },

    /**
     * @inheritdoc gpf.Callback:doApply
     * @private
     */
    _gpfDoApply = function (callback, scope, paramArray) {
        var
            len = arguments.length,
            idx = 3,
            paramIdx = 0;
        while (idx < len) {
            paramArray[paramIdx] = arguments[idx];
            ++idx;
            ++paramIdx;
        }
        return callback.apply(scope, paramArray);
    };

/**
 * Generic callback handler
 *
 * @param {Function} handler
 * @param {Object} scope
 * @constructor
 * @class gpf.Callback
 */
gpf.Callback = function (handler, scope) {
    gpf.ASSERT(handler, "Handler expected");
    this._handler = handler;
    if (scope) {
        this._scope = _gpfResolveScope(scope);
    }
};

// Define gpf.Callback interface (the 'old' way)
_gpfExtend(gpf.Callback.prototype, {

    /**
     * Function to call
     *
     * @type {Function}
     * @private
     */
    _handler: _gpfEmptyFunc,

    /**
     * Scope to apply
     *
     * @tyoe {Object}
     * @private
     */
    _scope: null,

    /**
     * Get the handler function
     *
     * @return {Function}
     */
    handler: function () {
        return this._handler;
    },

    /**
     * Get the scope
     *
     * @return {Object}
     */
    scope: function () {
        return this._scope;
    },

    /**
     * Executes the callback and override the scope if not defined
     *
     * @param {Object} scope Scope to apply if none set in the callback
     * @param {*} ... Forwarded to the callback handler
     * @return {*}
     */
    call: function() {
        return this.apply(arguments[0], _gpfArraySlice.apply(arguments, [1]));
    },

    /**
     * Executes the callback and override the scope if not defined
     *
     * @param {Object} scope Scope to apply if none set in the callback
     * @param {*[]} args Forwarded to the callback handler
     * @return {*}
     */
    apply: function(scope, args) {
        var finalScope = _gpfResolveScope(scope || this._scope);
        return this._handler.apply(finalScope, args || []);
    }
});

// define Static helpers
_gpfExtend(gpf.Callback, {

    /**
     * Resolve to a valid scope.
     * If no scope is provided, the default context is used
     *
     * @param {Object} [scope=undefined] scope
     * @return {Object}
     * @static
     */
    resolveScope: _gpfResolveScope,

    /**
     * Build a parameter array with
     * - Placeholders for known parameters
     * - Leading parameters filled wih the provided params
     *
     * @param {Number} count
     * @param {*} [params=undefined] params Additional parameters
     * appended at the end of the parameter list
     * @return {Array}
     * @static
     */
    buildParamArray: _gpfBuildParamArray,

    /**
     * Helper to call a function with a variable list of parameters
     *
     * @param {Function} callback
     * @param {Object} scope
     * @param {Array} paramArray array of parameters built with
     * gpf.Callback.buildParamArray
     * @param {...*} var_args
     * @return {*}
     */
    doApply: _gpfDoApply,

    /**
     * Get a method that is bound to the object
     *
     * @param {Object} obj
     * @param {String} method
     * @param {Boolean} [dynamic=false] dynamic Method is bound dynamically
     * (i.e. using the name) or statically (i.e. using function object)
     * @return {Function}
     * @closure
     */
    bind: function (obj, method, dynamic) {
        gpf.ASSERT("string" === typeof method, "Expected method name");
        gpf.ASSERT("function" === typeof obj[method],
            "Only methods can be bound");
        var boundMember = method + ":boundToThis",
            result;
        result = obj[boundMember];
        if (undefined === result) {
            if (true === dynamic) {
                result = function () {
                    return obj[method].apply(obj, arguments);
                };
            } else {
                result = obj[method].bind(obj);
            }
            obj[boundMember] = result;
        }
        return result;
    }

});
