/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfA*/ // gpf.attributes
/*global _gpfDefAttr*/ // gpf.define for attributes
/*global _gpfI*/ // gpf.interfaces
/*global _gpfDefIntrf*/ // gpf.define for interfaces
/*global _gpfIsArrayLike*/ // Return true if the parameter looks like an array
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _GPF_EVENT_END_OF_DATA*/ // gpf.events.EVENT_END_OF_DATA
/*exported _gpfArrayEnumerator*/
/*#endif*/

_gpfErrorDeclare("i_enumerator", {
    EnumerableInvalidMember:
        "$Enumerator can be associated to arrays only"
});

/**
 * Enumerable interface
 *
 * @class gpf.interfaces.IEnumerator
 * @extends gpf.interfaces.Interface
 */
_gpfDefIntrf("IEnumerator", {

    /**
     * Sets the enumerator to its initial position, which is *before* the
     * first element in the collection.
     *
     * NOTE once reset has been called, you must call moveNext to access (or
     * not)the first element.
     */
    reset: function () {
    },

    /**
     * Moves the enumerator to the next element of the enumeration.
     *
     * @param {gpf.events.Handler} eventsHandler
     * @return {Boolean}
     * - true if the enumerator was successfully advanced to the next element
     * - false if the enumerator has passed the end of the collection or it has
     *   to go through an asynchronous operation
     *
     * NOTE: if no eventsHandler is specified, no asynchronous operation will
     * be triggered when false is returned.
     *
     * @event gpf.events.EVENT_DATA
     * The asynchronous operation succeeded, the current item is available
     *
     * @event gpf.events.EVENT_END_OF_DATA
     * No more data is available
     */
    "[moveNext]": [gpf.$ClassEventHandler()],
    moveNext: function (eventsHandler) {
        _gpfIgnore(eventsHandler);
        return false;
    },

    /**
     * Gets the current element in the collection.
     *
     * @return {*}
     */
    current: function () {
        return null;
    },

    static: {

        /**
         * Enumerates all elements of the enumerator and call the callback
         * function.
         *
         * NOTE: reset is *not* called.
         *
         * @param {gpf.interfaces.IEnumerator} enumerator
         * @param {Function} callback receive each item of the enumerator,
         * signature is either:
         * - {*} element
         *
         * or
         * - {*} element
         * - {gpf.events.Handler} eventsHandler
         *
         * If the signature supports two parameter, the last one will be used
         * to control the iteration. The callback function has to trigger
         * - gpf.events.EVENT_CONTINUE
         * - gpf.events.EVENT_STOP
         *
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event gpf.events.EVENT_END_OF_DATA
         * No more data is available, the each function terminated
         *
         * @event gpf.events.EVENT_STOPPED
         * The processing function requested to stop enumeration
         */
        // TODO how to put attributes on static members?
        // "[each]": [gpf.$ClassEventHandler()],
        each: function (enumerator, callback, eventsHandler) {
            var
                iEnumerator = _gpfI.query(enumerator, _gpfI.IEnumerator),
                end = function (event) {
                    _gpfEventsFire.apply(enumerator, [event, {},
                        eventsHandler]);
                },
                process;
            if (1 < callback.length) {
                process = function (event) {
                    if (gpf.events.EVENT_CONTINUE === event.type) {
                        if (!iEnumerator.moveNext(process)) {
                            return;
                        }
                    } else if (gpf.events.EVENT_STOP === event.type) {
                        return end(gpf.events.EVENT_STOPPED);
                    } else if (gpf.events.EVENT_DATA !== event.type) {
                        return end(event.type);
                    }
                    callback(iEnumerator.current(), process);
                };
                if (iEnumerator.moveNext(process)) {
                    callback(iEnumerator.current(), process);
                }

            } else {
                process = function (event) {
                    if (gpf.events.EVENT_DATA !== event.type) {
                        return end(event.type);
                    }
                    do {
                        callback(iEnumerator.current());
                    } while (iEnumerator.moveNext(process));
                };
                while (iEnumerator.moveNext(process)) {
                    callback(iEnumerator.current());
                }
            }
        }

    }

});

/**
 * Builds an enumerable interface based on an array
 *
 * @param {Object[]} array Base of the enumeration
 * @return {Object} Object implementing the IEnumerable interface
 * @private
 */
function _gpfArrayEnumerator(array) {
    var pos = -1;
    return {
        reset: function () {
            pos = -1;
        },
        moveNext: function (eventsHandler) {
            var result;
            ++pos;
            result = pos < array.length;
            if (!result && eventsHandler) {
                _gpfEventsFire.apply(this, [
                    _GPF_EVENT_END_OF_DATA,
                    {},
                    eventsHandler
                ]);
            }
            return result;
        },
        current: function () {
            if (0 > pos || pos >= array.length) {
                return undefined;
            }
            return array[pos];
        }
    };
}

/**
 * Interface builder that connects to the EnumerableAttribute attribute
 *
 * @param {Object} object
 * @return {Object} Object implementing the IEnumerable interface
 * @private
 */
function _buildEnumeratorOnObjectArray(object) {
    // Look for related member
    var
        attributes = new _gpfA.Map(object).filter(_gpfA.EnumerableAttribute),
        members = attributes.members();
    return _gpfArrayEnumerator(object[members[0]]);
}

/**
 * Extend the class to provide an enumerator interface
 *
 * @class gpf.attributes.EnumerableAttribute
 * @extends gpf.attributes.ClassAttribute
 * @alias gpf.$Enumerable
 */
_gpfDefAttr("$Enumerable", _gpfA.ClassAttribute, {

    "Class": [gpf.$UniqueAttribute()],

    /**
     * @inheritDoc gpf.attributes.Attribute:_alterPrototype
     */
    _alterPrototype: function (objPrototype) {
        if (!_gpfIsArrayLike(objPrototype[this._member])) {
            throw gpf.Error.EnumerableInvalidMember();
        }
        _gpfA.add(objPrototype.constructor, "Class", [
            new _gpfA.InterfaceImplementAttribute(_gpfI.IEnumerator,
                _buildEnumeratorOnObjectArray)
        ]);
    }

});