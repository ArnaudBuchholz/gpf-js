(function () { /* Begin of privacy scope */
    "use strict";
    /*global document,window,console*/
    /*global process,require,exports,global*/
    /*global gpf*/
    /*jslint continue: true, nomen: true, plusplus: true*/

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
        };

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
        } else {
            if (dictionary instanceof Array) {
                return _arrayEachWithResult.apply(this, arguments);
            } else {
                return _dictionaryEachWithResult.apply(this, arguments);
            }
        }
        return defaultResult;
    };

    var
        /*
         * @internal
         * @param {type} member
         * @param {type} value
         */
        _assign = function (member, value) {
            // this = gpf.extend's arguments
            // this[0] is dictionary
            this[0][member] = value;
        },

        /*
         * @internal
         * @param {type} member
         * @param {type} value
         */
        _assign_or_call = function (member, value) {
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

        /*
         * @internal
         * @param {array} array
         * @param {any} a
         * @param {any} b
         * @returns {unresolved}
         */
        _equalSearchInDone = function (array, a, b) {
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
        };

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
            callbackToUse = _assign_or_call;
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
            if ("boolean" === expectedType) {
                if ("string" === valueType) {
                    if ("yes" === value || "true" === value) {
                        return true;
                    } else {
                        return 0 !== parseInt(value, 10);
                    }
                } else if ("number" === valueType) {
                    return 0 !== value;
                }
            } else if ("number" === expectedType) {
                if ("string" === valueType) {
                    return parseFloat(value);
                }
            } else if ("object" === expectedType) {
                if (defaultValue instanceof Date && "string" === valueType) {
                    return gpf.dateFromComparableFormat(value);
                }
            }
            return defaultValue;
        },

        /*
         * Compares a and b and return true if they are strictly equal.
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
         * @returns {Boolean}
         */
        equal: function (a, b) {
            if (a === b) {
                return true;
            }
            if (typeof a !== typeof b) {
                return false;
            }
            if (null === a || null === b || "object" !== typeof a) {
                return false;
            }
            var
                member,
                count,
                ma,
                mb,
                done = [],
                stack = [a, b];
            while (0 !== stack.length) {
                b = stack.pop();
                a = stack.pop();
                done.push({a: a, b: b });
                if (a.prototype !== b.prototype) {
                    return false;
                }
                count = 0;
                for (member in a) {
                    if (a.hasOwnProperty(member)) {
                        ++count;
                        ma = a[member];
                        mb = b[member];
                        if (ma === mb) {
                            continue; // It works when the same object/type
                        }
                        if (typeof ma !== typeof mb) {
                            return false;
                        }
                        if (null === ma || null === mb
                            || "object" !== typeof ma) {
                            return false; // Because we know that ma !== mb
                        }
                        if (undefined === _equalSearchInDone(done, ma, mb)) {
                            stack.push(ma);
                            stack.push(mb);
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
