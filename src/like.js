/*#ifndef(UMD)*/
"use strict";
/*#endif*/

var
    /**
     * Object representing the context of a like operation:
     * It remembers what needs to be done and what has been done already
     *
     * @class _LikeContext
     * @constructor
     * @private
     */
    _LikeContext = function () {
        this._todo = [];
        this._done = [];
    },

    /**
     * gpf.like comparison of values knowing they have different types.
     * This is a terminal function.
     *
     * @param {*} a
     * @param {*} b
     * @param {Boolean} alike If True, typecasting is applied on Number and
     * String
     * @return {boolean}
     * @private
     */
    _gpfAlike = function /*gpf:inline*/ (a, b, alike) {
        if (alike && ("object" === typeof a || "object" === typeof b)) {
            /**
             * One of the two is an object but not the other,
             * Consider typecasting Number and String
             */
            if (a instanceof String || b instanceof String) {
                return a.toString() ===  b.toString();
            }
            if (a instanceof Number || b instanceof Number) {
                return a.valueOf() ===  b.valueOf();
            }
            return false;
        }
        return false;
    },

    /**
     * Internal version of gpf.like (but not recursive)
     *
     * @param {*} a
     * @param {*} b
     * @param {Boolean} alike
     * @param {_LikeContext} context
     * @return {boolean}
     * @private
     */
    _gpfLike = function /*gpf:inline*/ (a, b, alike, context) {
        if (a === b) {
            return true;
        }
        if (typeof a !== typeof b) {
            return _gpfAlike(a, b, alike);
        }
        if (null === a || null === b || "object" !== typeof a) {
            return false; // Because we know that a !== b
        }
        if (undefined === _gpfLikeSearchInDone(context.done, a, b)) {
            context.todo.push(a);
            context.todo.push(b);
        }
        return true;
    },

    /**
     * gpf.like comparison of objects members
     *
     * @param {*} a
     * @param {*} b
     * @param {Boolean} alike
     * @return {boolean}
     * @private
     */
    _gpfLikeMembers = function /*gpf:inline*/ (a, b, alike, context) {
        var
            member,
            count,
            stacks = {
            };
        while (0 !== stacks.todo.length) {
            b = stacks.todo.pop();
            a = stacks.todo.pop();
            if (a.prototype !== b.prototype) {
                return false;
            }
            stacks.done.push({a: a, b: b });
            count = 0;
            for (member in a) {
                if (a.hasOwnProperty(member)) {
                    ++count;
                    if (!_gpfLike(a[member], b[member], alike,
                            stacks)) {
                        return false;
                    }
                }
            }
            for (member in b) {
                if (b.hasOwnProperty(member)) {
                    --count;
                }
            }
            if (0 !== count) {
                return false;
            }
        }
        return true;
    };

_LikeContext.prototype = {

    _todo: [],
    _done: [],

    /**
     * Return false if a has already been compared with b
     *
     * @param {*} a
     * @param {*} b
     * @return {Boolean}
     */
    mustCompare: function (a, b) {
        var
            array = this._done,
            len = array.length,
            idx,
            firstValue,
            secondValue;
        for (idx = 0; idx < len; ++idx) {
            firstValue = array[idx++];
            secondValue = array[idx];
            if ((firstValue === a && secondValue === b)
                || (secondValue === a && firstValue === b)) {
                return false; // Already compared
            }
        }
        return true;
    }
};

/*
 * Compares a and b and return true if they are look-alike (all members
 * have the same type and same value).
 *
 * NOTES:
 * 14/04/2013 17:19:43
 * Generates too much recursion, changed the algorithm to avoid
 * recursion using document.body (and any kind of object that references
 * other objects) I found that it was necessary to keep track of already
 * processed objects.
 *
 * @param {*} a
 * @param {*} b
 * @param {Boolean} [alike=false] alike Allow to be tolerant on
 *        primitive types compared with their object equivalent
 * @return {Boolean}
 */
gpf.like = function (a, b, alike) {
    var context = new _LikeContext();
    if (_gpfLike(a, b, alike, context)) {
        if (context.todo.length) {

        }
        return true;
    }
    return false;
};
