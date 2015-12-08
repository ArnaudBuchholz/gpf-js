/*#ifndef(UMD)*/
"use strict";
/*global _GPF_EVENT_END_OF_DATA*/ // gpf.events.EVENT_END_OF_DATA
/*global _GPF_EVENT_ERROR*/ // gpf.events.EVENT_ERROR
/*global _gpfAssert*/ // Assertion method
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _gpfExtend*/ // gpf.extend
/*global _gpfI*/ // gpf.interfaces
/*global _gpfStringCapitalize*/ // Capitalize the string
/*global _gpfStringEscapeFor*/ // Make the string content compatible with lang
/*global _gpfStringReplaceEx*/ // String replacement using dictionary map
/*exported _gpfExtractFromStringArray*/
/*#endif*/

/**
 * Extract the first characters of a string array
 *
 * @param {Strings[]} strings This array is modified after extraction
 * @param {Number} [size=0] size Number of characters to get, all if 0
 * @return {String}
 */
function _gpfExtractFromStringArray (strings, size) {
    var stringsCount = strings.length,
        result,
        count,
        string,
        len;
    if (size) {
        // Check how many strings can be included in the result
        count = 0;
        do {
            string = strings[count];
            len = string.length;
            if (len <= size) {
                ++count;
                size -= len;
            } else {
                break;
            }
        } while (0 < size && count < stringsCount);
        if (0 === size) {
            // Simple case (no need to cut the last item)
            return strings.splice(0, count).join("");
        }
        if (count < stringsCount) {
            // Last item has to be cut
            result = [];
            if (0 < count) {
                result.push(strings.splice(0, count - 1).join(""));
            }
            // Remove first item
            string = strings.shift();
            // Add the missing characters
            result.push(string.substr(0, size));
            // Put back the remaining characters
            strings.unshift(string.substr(size));
            // Consolidate the string
            return result.join("");
        }
    }
    // Take the whole content & clear the array
    return strings.splice(0, stringsCount).join("");
}

var
    /**
     * Implements ITextStream on top of a string (FIFO read / write)
     *
     * @class StringStream
     * @extends gpf.events.Target
     * @implements gpf.interfaces.ITextStream
     * @private
     */
    StringStream = _gpfDefine("StringStream", Object, {
        "[Class]": [gpf.$InterfaceImplement(_gpfI.IStream)],
        "+": {
            /**
             * @param {String} [string=undefined] string
             */
            constructor: function (string) {
                if (undefined !== string && string.length) {
                    this._buffer = [string];
                } else {
                    this._buffer = [];
                }
            },

            //region gpf.interfaces.IStream

            // @implements gpf.interfaces.ITextStream:read
            read: function (count, eventsHandler) {
                var result;
                if (0 === this._buffer.length) {
                    _gpfEventsFire.apply(this, [_GPF_EVENT_END_OF_DATA, {}, eventsHandler]);
                } else {
                    result = gpf.stringExtractFromStringArray(this._buffer,
                        count);
                    _gpfEventsFire.apply(this, [
                        gpfI.IReadableStream.EVENT_DATA,
                        {
                            buffer: result
                        },
                        eventsHandler
                    ]);
                }
            },

                /**
                 * @implements gpf.interfaces.ITextStream:write
                 */
                write: function (buffer, eventsHandler) {
                    _gpfAssert(buffer && buffer.length, "Write must contain data");
                    this._buffer.push(buffer);
                    _gpfEventsFire.apply(this, [
                        gpfI.IReadableStream.EVENT_READY,
                        {},
                        eventsHandler
                    ]);
                },

                //endregion

                /**
                 * Consolidate the result string
                 * @return {String}
                 */
                consolidateString: function () {
                    return this._buffer.join("");
                }

            },

        "-": {

                /**
                 * @type {String[]}
                 * @private
                 */
                _buffer: []

            }

    });

//region stringFromStream helpers

function _stringStreamConcat (previous, buffer) {
    if (undefined === previous) {
        return [buffer];
    } else if (undefined !== buffer) {
        previous.push(buffer);
        return previous;
    } else {
        return previous.join("");
    }
}

//endregion

_gpfExtend(gpf, {

    "[capitalize]": [gpf.$ClassExtension(String)],

        /**
         * Capitalize the string
         *
         * @param {String} that
         * @return {String}
         */
    capitalize: _gpfStringCapitalize,


    "[replaceEx]": [gpf.$ClassExtension(String)],

        /**
         * Substitutes all occurrences of the keys found in the replacements
         * object with their values
         *
         * @param {String} that
         * @param {Object} replacements map of strings to search and replace
         * @return {String}
         */
    replaceEx: _gpfStringReplaceEx,

    "[escapeFor]": [gpf.$ClassExtension(String)],

        /**
         * Adapt the string content to be compatible with the provided language
         *
         * @param {String} that
         * @param {String} language
         * @return {String}
         */
    escapeFor: _gpfStringEscapeFor,

        // TODO Should be a static extension as 'that' is not used
    "[stringExtractFromStringArray]": [gpf.$ClassExtension(String,
            "fromStringArray")],

        /**
         * Extract the first characters of a string array
         *
         * @param {Strings[]} strings This array is modified after extraction
         * @param {Number} [size=0] size Number of characters to get, all if 0
         * @return {String}
         */
    stringExtractFromStringArray: function (strings, size) {
        var
                stringsCount = strings.length,
                result,
                count,
                string,
                len;
        if (!size) {
                // Take the whole content & clear the array
                result = strings.splice(0, stringsCount).join("");
            } else {
                // Check how many string can be included in the result
                count = 0;
                do {
                    string = strings[count];
                    len = string.length;
                    if (len <= size) {
                        ++count;
                        size -= len;
                    } else {
                        break;
                    }
                } while (0 < size && count < stringsCount);
                if (0 === size) {
                    // Simple case (no need to cut the last item)
                    result = strings.splice(0, count).join("");
                } else if (count < stringsCount) {
                    // Last item has to be cut
                    result = [];
                    if (0 < count) {
                        result.push(strings.splice(0, count - 1).join(""));
                    }
                    // Remove first item
                    string = strings.shift();
                    // Add the missing characters
                    result.push(string.substr(0, size));
                    // Put back the remaining characters
                    strings.unshift(string.substr(size));
                    // Consolidate the string
                    result = result.join("");
                } else {
                    // No last item to cut, the whole array fit
                    result = strings.splice(0, stringsCount).join("");
                }
            }
        return result;
    },

    "[stringToStream]": [gpf.$ClassExtension(String, "toStream")],

        /**
         * Converts the string into a stream
         *
         * @param {String} that
         * @return {Object} Implementing gpf.interfaces.ITextStream
         */
    stringToStream: function (that) {
        return new StringStream(that);
    },

        // TODO Should be a static extension as 'that' is not used
    "[stringFromStream]": [gpf.$ClassExtension(String, "fromStream")],

        /**
         * Converts the stream into a string
         *
         * @param {gpf.interfaces.ITextStream} stream
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event gpf.events.EVENT_DATA
         * finished reading the stream, the buffer is provided
         *
         * @eventParam {String} buffer
         */
    stringFromStream: function (stream, eventsHandler) {
        if (stream instanceof StringStream) {
                _gpfEventsFire.apply(this, [
                    gpfI.IReadableStream.EVENT_DATA,
                    {
                        buffer: stream.consolidateString()
                    },
                    eventsHandler
                ]);
            } else {
                gpf.stream.readAll(stream, _stringStreamConcat, eventsHandler);
            }
    }

});
