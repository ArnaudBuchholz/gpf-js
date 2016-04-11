/*#ifndef(UMD)*/
"use strict";
/*global _gpfFalseFunc*/ // An empty function returning false
/*#endif*/

/**
 * Object representing the context of a like operation.
 * It remembers what objects must be compared and the ones that are already matching.
 *
 * @param {Boolean} [alike=false] alike Allow to be tolerant on primitive types compared with their object equivalent.
 * If alike, the objects may not have the same class.
 *
 * @class _GpfLikeContext
 * @constructor
 */
function _GpfLikeContext (alike) {
    /*jshint validthis:true*/ // constructor
    this._pending = [];
    this._done = [];
    // Override for this instance only
    if (true === alike) {
        this._haveDifferentPrototypes = _gpfFalseFunc;
    } else {
        this._alike = _gpfFalseFunc;
    }
}

_GpfLikeContext.prototype = {

    // Array of objects to be compared (filled by pairs)
    _pending: [],

    // Array of objects already compared (filled by pairs)
    _done: [],

    // Get associated pair
    _getPair: function (array, index) {
        if (index % 2) {
            return array[index - 1];
        }
        return array[index + 1];
    },

    /**
     * Check in the stack of done if parameters were never compared
     *
     * @param {Object} a
     * @param {Object} b
     * @return {Boolean}
     */
    _neverCompared: function (a, b) {
        var done = this._done,
            indexOfA,
            comparedWith;
        indexOfA = done.indexOf(a);
        while (-1 < indexOfA) {
            comparedWith = this._getPair(done, indexOfA);
            if (comparedWith === b) {
                return false; // Already compared
            }
            indexOfA = done.indexOf(a, indexOfA + 1);
        }
        return true;
    },

    /**
     * If a was never compared with b, adds the pair to the pending list.
     *
     * @param {Object} a
     * @param {Object} b
     */
    _stack: function (a, b) {
        var pending;
        if (this._neverCompared(a, b)) {
            pending = this._pending;
            pending.push(a);
            pending.push(b);
        }
    },

    /**
     * Check if the objects have different prototypes
     *
     * @param {Object} a
     * @param {Object} b
     * @return {Boolean}
     */
    _haveDifferentPrototypes: function (a, b) {
        return a.constructor !== b.constructor;
    },

    // compare the two objects
    _areDifferent: function (a, b) {
        return this._haveDifferentPrototypes(a, b) || this._checkMembersDifferences(a, b);
    },

    /**
     * Process the pending list
     *
     * @return {Boolean}
     */
    explore: function () {
        var pending = this._pending,
            done = this._done,
            a,
            b;
        while (0 !== pending.length) {
            b = pending.pop();
            a = pending.pop();
            done.push(a, b);
            if (this._areDifferent(a, b)) {
                return false;
            }
        }
        return true;
    },

    /**
     * Check if members are different
     *
     * @param {*} a
     * @param {*} b
     * @returns {Number}
     */
    _checkMembersDifferences: function (a, b) {
        var me = this,
            membersOfA = Object.keys(a);
        // a members comparison with b
        if (!membersOfA.every(function (member) {
            return me.like(a[member], b[member]);
        })) {
            return true;
        }
        // Difference on members count?
        return membersOfA.length  !== Object.keys(b).length;
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
            return a.valueOf();
        }
        return a;
    },

    /**
     * gpf.like comparison of values knowing they have different types.
     * DOWNCAST the values to their scalar equivalent (if any)
     *
     * @param {*} a
     * @param {*} b
     * @return {Boolean}
     */
    _alike: function (a, b) {
        return this._downcast(a) === this._downcast(b);
    },

    /**
     * Check if objects are the same
     *
     * @param {Object} a
     * @param {Object} b
     * @returns {boolean}
     */
    _objectLike: function (a, b) {
        if (null === a || null === b || "object" !== typeof a) {
            return false; // Because we know that a !== b
        }
        this._stack(a, b);
        return true;
    },

    /**
     * Internal version of gpf.like
     *
     * @param {*} a
     * @param {*} b
     * @return {Boolean}
     */
    like: function (a, b) {
        if (a === b) {
            return true;
        }
        if (typeof a !== typeof b) {
            return this._alike(a, b);
        }
        return this._objectLike(a, b);
    }

};

/*
 * Compares a and b and return true if they are look-alike (all members have the same type and same value).
 *
 * NOTES:
 * 2013-04-14
 * Generates too much recursion, changed the algorithm to avoid recursion using document.body (and any kind of object
 * that references other objects) I found that it was necessary to keep track of already processed objects.
 *
 * 2015-02-26
 * Rewrote to be easier to maintain (and easier to understand).
 *
 * @param {*} a
 * @param {*} b
 * @param {Boolean} [alike=false] alike Allow to be tolerant on primitive types compared with their object equivalent
 * @return {Boolean}
 */
gpf.like = function (a, b, alike) {
    var context = new _GpfLikeContext(alike);
    return context.like(a, b) && context.explore();
};
