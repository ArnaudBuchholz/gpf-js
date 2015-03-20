/*#ifndef(UMD)*/
"use strict";
/*global _gpfFalseFunc*/ // An empty function returning false
/*#endif*/

var
    /**
     * Object representing the context of a like operation.
     * It remembers what objects must be compared and the ones that are already
     * matching.
     *
     * @param {Boolean} [alike=false] alike Allow to be tolerant on primitive
     * types compared with their object equivalent. If alike, the objects may
     * not have the same class.
     *
     *
     * @class _GpfLikeContext
     * @constructor
     * @private
     */
    _GpfLikeContext = function (alike) {
        this._pending = [];
        this._done = [];
        // Override for this instance only
        if (true !== alike) {
            this._alike = _gpfFalseFunc;
        } else {
            this._haveDifferentPrototypes = _gpfFalseFunc;
        }
    };

_GpfLikeContext.prototype = {

    /**
     * Array of objects to be compared (filled by pairs)
     *
     * type {Object[]}
     * @private
     */
    _pending: [],

    /**
     * Array of objects already compared (filled by pairs)
     *
     * type {Object[]}
     * @private
     */
    _done: [],

    /**
     * If a was never compared with b, adds the pair to the pending list.
     *
     * @param {Object} a
     * @param {Object} b
     * @private
     */
    _stack: function (a, b) {
        var
            array = this._done,
            indexOfA,
            comparedWith;
        indexOfA = array.indexOf(a);
        while (-1 < indexOfA) {
            if (indexOfA % 2) {
                comparedWith = array[indexOfA - 1];
            } else {
                comparedWith = array[indexOfA + 1];
            }
            if (comparedWith === b) {
                return; // Already compared
            }
            indexOfA = array.indexOf(a, indexOfA + 1);
        }
        // Adds to the pending list
        array = this._pending;
        array.push(a);
        array.push(b);
    },

    /**
     * Check if the objects have different prototypes
     *
     * @param {Object} a
     * @param {Object} b
     * @return {boolean}
     * @private
     */
    _haveDifferentPrototypes: function (a, b) {
        return a.prototype !== b.prototype;
    },

    /**
     * Process the pending list
     *
     * @return {boolean}
     */
    explore: function () {
        var
            pending = this._pending,
            a,
            b,
            done = this._done,
            membersCount,
            member;
        while (0 !== pending.length) {
            b = pending.pop();
            a = pending.pop();
            // Are the object sharing the same prototype?
            if (this._haveDifferentPrototypes(a, b)) {
                return false;
            }
            done.push(a, b);
            membersCount = 0;
            // a members
            for (member in a) {
                if (a.hasOwnProperty(member)) {
                    ++membersCount;
                    if (!this.like(a, b)) {
                        return false;
                    }
                }
            }
            // b members
            for (member in b) {
                if (b.hasOwnProperty(member)) {
                    --membersCount;
                }
            }
            // Difference on members count?
            if (0 !== membersCount) {
                return false;
            }
        }
        return true;
    },

    /**
     * Downcast a value to its scalar equivalent (if possible)
     *
     * @param {*} a
     * @return {*}
     */
    _downcast: function (a) {
        if ("object" === typeof a) {
            if (a instanceof String) {
                return a.toString();
            }
            if (a instanceof Number) {
                return a.valueOf();
            }
            if (a instanceof Boolean) {
                return !!a;
            }
        }
        return a;
    },

    /**
     * gpf.like comparison of values knowing they have different types.
     * DOWNCAST the values to their scalar equivalent (if any)
     *
     * @param {*} a
     * @param {*} b
     * @return {boolean}
     * @private
     */
    _alike: function (a, b) {
        return this._downcast(a) === this._downcast(b);
    },

    /**
     * Internal version of gpf.like
     *
     * @param {*} a
     * @param {*} b
     * @return {boolean}
     */
    like: function (a, b) {
        if (a === b) {
            return true;
        }
        if (typeof a !== typeof b) {
            return this._alike(a, b);
        }
        if (null === a || null === b || "object" !== typeof a) {
            return false; // Because we know that a !== b
        }
        this._stack(a, b);
        return true;
    }

};

/*
 * Compares a and b and return true if they are look-alike (all members
 * have the same type and same value).
 *
 * NOTES:
 * 2013-04-14
 * Generates too much recursion, changed the algorithm to avoid
 * recursion using document.body (and any kind of object that references
 * other objects) I found that it was necessary to keep track of already
 * processed objects.
 *
 * 2015-02-26
 * Rewrote to be easier to maintain (and easier to understand).
 *
 * @param {*} a
 * @param {*} b
 * @param {Boolean} [alike=false] alike Allow to be tolerant on primitive types
 * compared with their object equivalent
 * @return {Boolean}
 */
gpf.like = function (a, b, alike) {
    var context = new _GpfLikeContext(alike);
    return context.like(a, b) && context.explore();
};
