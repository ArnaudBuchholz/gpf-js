(function () { /* Begin of privacy scope */
    "use strict";

/*
    This package contains general helpers that will be used everywhere else
*/

    var
        _arrayEachWithResult = function (array, memberCallback, defaultResult) {
            var
                result,
                len = array.length,
                idx;
            for (idx = 0; idx < len; ++idx) {
                result = memberCallback.apply(this, [idx, array[idx]]);
                if (undefined !== result) {
                    return result;
                }
            }
            return defaultResult;
        },

        _arrayEach = function (array, memberCallback) {
            var
                len = array.length,
                idx;
            for (idx = 0; idx < len; ++idx) {
                memberCallback.apply(this, [idx, array[idx]]);
            }
        },

        _dictionaryEachWithResult = function (dictionary, memberCallback,
            defaultResult) {
            var
                result,
                member;
            for (member in dictionary) {
                if (dictionary.hasOwnProperty(member)) {
                    result = memberCallback.apply(this, [member,
                        dictionary[member]]);
                    if (undefined !== result) {
                        return result;
                    }
                }
            }
            return defaultResult;
        },

        _dictionaryEach = function (dictionary, memberCallback) {
            var
                member;
            for (member in dictionary) {
                if (dictionary.hasOwnProperty(member)) {
                    memberCallback.apply(this, [member, dictionary[member]]);
                }
            }
        },

        _assign = function (member, value) {
            // this = gpf.extend's arguments
            // this[0] is dictionary
            this[0][member] = value;
        },

        _assignOrCall = function (member, value) {
            // this = gpf.extend's arguments
            var
                dictionary = this[0],
                overwriteCallback = this[2];
            // TODO: see if in is faster
            if (undefined !== dictionary[member]) {
                overwriteCallback(dictionary, member, value);
            } else {
                dictionary[member] = value;
            }
        },

        _likeSearchInDone = function /*gpf:inline*/ (array, a, b) {
            var
                idx,
                ia,
                ib,
                len = array.length;
            for (idx = 0; idx < len; ++idx) {
                ia = array[idx].a;
                ib = array[idx].b;
                if ((ia === a && ib === b) || (ib === a && ia === b)) {
                    return idx;
                }
            }
            return undefined;
        },

        _likeTypes = function /*gpf:inline*/ (a, b, alike) {
            if (alike && ("object" === typeof a || "object" === typeof b)) {
                /*
                 One of the two is an object but not the other,
                 Consider downcasting Number and String
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

        _likeCompareMembers = function /*gpf:inline*/ (ma, mb, alike, stacks) {
            if (ma !== mb) {
                if (typeof ma !== typeof mb && !_likeTypes(ma, mb, alike)) {
                    return false;
                }
                if (null === ma || null === mb
                    || "object" !== typeof ma) {
                    return false; // Because we know that ma !== mb
                }
                if (undefined === _likeSearchInDone(stacks.done, ma, mb)) {
                    stacks.todo.push(ma);
                    stacks.todo.push(mb);
                }
            }
            return true;
        },

        _likeMembers = function /*gpf:inline*/ (a, b, alike) {
            var
                member,
                count,
                stacks = {
                    todo: [a, b],
                    done: []
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
                        if (!_likeCompareMembers(a[member], b[member], alike,
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
        },

        _values = {
            boolean: function (value, valueType, defaultValue) {
                if ("string" === valueType) {
                    if ("yes" === value || "true" === value) {
                        return true;
                    }
                    return 0 !== parseInt(value, 10);
                }
                if ("number" === valueType) {
                    return 0 !== value;
                }
                return defaultValue;
            },

            number:  function (value, valueType, defaultValue) {
                if ("string" === valueType) {
                    return parseFloat(value);
                }
                return defaultValue;
            },

            string: function (value, valueType, defaultValue) {
                if (value instanceof Date) {
                    return gpf.dateToComparableFormat(value);
                }
                return value.toString();
            },

            object: function (value, valueType, defaultValue) {
                if (defaultValue instanceof Date && "string" === valueType) {
                    return gpf.dateFromComparableFormat(value);
                }
                return defaultValue;
            }
        },

        // https://github.com/jshint/jshint/issues/525
        Func = Function; // avoid JSHint error

    gpf._func = function (source) {
        return new Func(source);
    };

    /*jshint unused: false */ // Because of arguments
    /*
     * Enumerate dictionary members and call memberCallback for each of them.
     * If defaultResult is defined, memberCallback may return a result.
     * If memberCallback returns anything, the function stops and returns it.
     * Otherwise, the defaultResult is returned.
     * When defaultResult is not defined, memberCallback result is ignored.
     *  
     * @param {object} dictionary
     * @param {function} memberCallback
     * @param {any} defaultResult
     * @returns {any}
     * @chainable
     * @forwardThis
     */
    gpf.each = function (dictionary, memberCallback, defaultResult) {
        if (undefined === defaultResult) {
            if (dictionary instanceof Array) {
                _arrayEach.apply(this, arguments);
            } else {
                _dictionaryEach.apply(this, arguments);
            }
            return undefined;
        }
        if (dictionary instanceof Array) {
            return _arrayEachWithResult.apply(this, arguments);
        }
        return _dictionaryEachWithResult.apply(this, arguments);
    };
    /*jshint unused: true */

    /*
     * Appends members of additionalProperties to the dictionary object.
     * If a conflict has to be handled (i.e. member exists on both objects),
     * the overwriteCallback has to handle it.
     * 
     * @param {object} dictionary
     * @param {object} additionalProperties
     * @param {function} overwriteCallback
     * @returns {object} the modified dictionary
     * @chainable
     */
    gpf.extend = function (dictionary, additionalProperties,
        overwriteCallback) {
        var callbackToUse;
        if (undefined === overwriteCallback) {
            callbackToUse = _assign;
        } else {
            callbackToUse = _assignOrCall;
        }
        gpf.each.apply(arguments, [additionalProperties, callbackToUse]);
        return dictionary;
    };

    gpf.extend(gpf, {

        /*
         * Converts the provided value to match the expectedType.
         * If not specified or impossible to do so, defaultValue is returned.
         * When expectedType is not provided, it is deduced from defaultValue.
         * 
         * @param {any} value
         * @param {any} default value
         * @param {string} [expectedType=typeof defaultValue] expected type
         * @returns {any}
         */
        value: function (value, defaultValue, expectedType) {
            var valueType = typeof value;
            if (!expectedType) {
                expectedType = typeof defaultValue;
            }
            if (expectedType === valueType) {
                return value;
            }
            if ("undefined" === valueType || !value) {
                return defaultValue;
            }
            return _values[expectedType](value, valueType, defaultValue);
        },

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
         * @param {any} a
         * @param {any} b
         * @param {boolean} [alike=false] alike Allow to be tolerant on
         *        primitive types compared with their object equivalent
         * @returns {Boolean}
         */
        like: function (a, b, alike) {
            if (a === b) {
                return true;
            }
            if (typeof a !== typeof b) {
                return _likeTypes(a, b, alike);
            }
            if (null === a || null === b || "object" !== typeof a) {
                return false;
            }
            return _likeMembers(a, b, alike);
        },

        /*
         * Find the first member of dictionary which value equals to value.
         * 
         * @param {object/array} dictionary
         * @param {any} value
         * @returns {string/number/undefined} undefined if not found
         */
        test: function (dictionary, value) {
            var idx;
            if (dictionary instanceof Array) {
                for (idx = 0; idx < dictionary.length; ++idx) {
                    if (dictionary[idx] === value) {
                        return idx;
                    }
                }
            } else {
                for (idx in dictionary) {
                    if (dictionary.hasOwnProperty(idx)
                        && dictionary[idx] === value) {
                        return idx;
                    }
                }
            }
            return undefined;
        },

        /*
         * Inserts the value in the array if not already present.  
         * 
         * @param {array} array
         * @param {any} value
         * @returns {array}
         * @chainable
         */
        set: function (array, value) {
            gpf.ASSERT(array instanceof Array,
                "gpf.set must be used with an Array");
            var
                idx,
                len = array.length;
            for (idx = 0; idx < len; ++idx) {
                if (array[idx] === value) {
                    return array; // Already set
                }
            }
            array.push(value);
            return array;
        },

        /*
         * Removes the member of 'dictionary' which value equals 'value'.
         * NOTE: that the object is modified. 
         * 
         * @param {object/array} dictionary
         * @param {any} value
         * @returns {object/array} dictionary
         * @chainable
         */
        clear: function (dictionary, value) {
            var idx;
            if (dictionary instanceof Array) {
                for (idx = 0; idx < dictionary.length; ++idx) {
                    if (dictionary[idx] === value) {
                        dictionary.splice(idx, 1);
                        break;
                    }
                }
            } else {
                for (idx in dictionary) {
                    if (dictionary.hasOwnProperty(idx)
                        && dictionary[idx] === value) {
                        break;
                    }
                }
            }
            return dictionary;
        }

    });

}()); /* End of privacy scope */
