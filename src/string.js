/*#ifndef(UMD)*/
/*global _gpfStringReplaceEx*/ // String replacement using dictionary map
/*global _gpfStringEscapeFor*/ // Make the string content compatible with lang
/*global _gpfStringCapitalize*/ // Capitalize the string
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _GPF_EVENT_ERROR*/ // gpf.events.EVENT_ERROR
"use strict";
/*#endif*/

    var
        gpfI = gpf.interfaces,

        /**
         * Implements ITextStream on top of a string (FIFO read / write)
         *
         * @class StringStream
         * @extend gpf.events.Target
         * @implements gpf.interfaces.ITextStream
         * @private
         */
        StringStream = gpf.define("StringStream", {

            "[Class]": [gpf.$InterfaceImplement(gpf.interfaces.ITextStream)],

            public: {

                /**
                 * @param {String} [string=undefined] string
                 * @constructor
                 */
                constructor: function(string){
                    if (undefined !== string && string.length) {
                        this._buffer = [string];
                    } else {
                        this._buffer = [];
                    }
                },

                //region gpf.interfaces.ITextStream

                /**
                 * @implements gpf.interfaces.ITextStream:read
                 */
                read: function(count, eventsHandler) {
                    var
                        result;
                    if (0 === this._buffer.length) {
                        _gpfEventsFire.apply(this, [
                            gpfI.IReadableStream.EVENT_END_OF_STREAM,
                            {},
                            eventsHandler
                        ]);
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
                    gpf.ASSERT(buffer && buffer.length,
                        "Write must contain data");
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
                consolidateString: function() {
                    return this._buffer.join("");
                }

            },

            private: {

                /**
                 * @type {String[]}
                 * @private
                 */
                _buffer: []

            }

        });

    gpf.extend(gpf, {

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
         * @returns {string}
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
        },

        "[stringFromFile]": [gpf.$ClassExtension(String, "fromFile")],

        /**
         * Completely reads a file
         *
         * @param {*} path
         * @param {String} encoding
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event gpf.events.EVENT_DATA
         * finished reading the file, the buffer is provided
         *
         * @eventParam {String} buffer
         */
        stringFromFile: function (path, encoding, eventsHandler) {
            gpf.fs.getInfo(path,
                new StringFromFileScope(path, encoding, eventsHandler));
        }

    });

    //region stringFromStream helpers

    function _stringStreamConcat(previous, buffer) {
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

    //region stringFromFile helpers

    /**
     * Creates a custom EventsHandler to sequence the calls to be made
     *
     * @param {*} path
     * @param {String} encoding
     * @param {gpf.events.Handler} eventsHandler
     * @constructor
     */
    function StringFromFileScope (path, encoding, eventsHandler) {
        this._path = path;
        this._encoding = encoding;
        this._eventsHandler = eventsHandler;
        this.scope = this;
    }

    StringFromFileScope.prototype = {
        _path: null,            // File path
        _encoding: "",          // Encoding
        _eventsHandler: null,   // Original events handler
        _step: 0,               // 0: getInfo, 1: readAsBinaryStream
        scope: null             // This eventsHandler scope
    };

    /**
     * ready event handler
     *
     * @param {gpf.Event} event
     */
    StringFromFileScope.prototype.ready = function (event) {
        if (0 === this._step) {
            var info = event.get("info");
            if (info.type === gpf.fs.TYPE_NOT_FOUND) {
                _gpfEventsFire.apply(this, [
                    _GPF_EVENT_ERROR, {
                        error: gpf.Error.FileNotFound()
                    }, this._eventsHandler
                ]);
                return;
            }
            this._step = 1;
            gpf.fs.readAsBinaryStream(this._path, this);
        } else {
            var stream = event.get("stream");
            var decoder = gpf.encoding.createDecoder(stream, this._encoding);
            gpf.stringFromStream(decoder, this);
        }
    };

    /**
     * Any other event handler
     *
     * @param {gpf.Event} event
     */
    StringFromFileScope.prototype["*"] = function (event) {
        // Forward to original handler (error or data)
        _gpfEventsFire.apply(this, [event, {}, this._eventsHandler]);
    };

    //endregion
