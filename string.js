/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    var
        gpfI = gpf.interfaces,
        gpfFireEvent = gpf.events.fire,

        _escapes = {

            javascript: {
                "\\": "\\\\",
                "\"": "\\\"",
                "\n": "\\n",
                "\r": "\\r",
                "\t": "\\t"
            },

            xml: {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;"
            },

            html: {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\u00E9": "&eacute;",
                "\u00E8": "&egrave;",
                "\u00EA": "&ecirc;",
                "\u00E1": "&aacute;",
                "\u00E0": "&agrave;"
            }

        },

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
                        gpfFireEvent.apply(this, [
                            gpfI.IReadableStream.EVENT_END_OF_STREAM,
                            eventsHandler
                        ]);
                    } else {
                        result = gpf.stringExtractFromStringArray(this._buffer,
                            count);
                        gpfFireEvent.apply(this, [
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
                    gpfFireEvent.apply(this, [
                        gpfI.IReadableStream.EVENT_READY,
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
        // Declared in base.js

        "[replaceEx]": [gpf.$ClassExtension(String)],

        /**
         * Substitutes all occurrences of the keys found in the replacements
         * object with their values
         *
         * @param {String} that
         * @param {Object} replacements map of strings to search and replace
         * @return {String}
         */
        replaceEx: function (that, replacements) {
            var
                result = that,
                key;
            for (key in replacements) {
                if (replacements.hasOwnProperty(key)) {
                    if (-1 < result.indexOf(key)) {
                        result = result.split(key).join(replacements[key]);
                    }
                }
            }
            return result;
        },

        "[escapeFor]": [gpf.$ClassExtension(String)],

        /**
         * Adapt the string content to be compatible with the provided language
         *
         * @param {String} that
         * @param {String} language
         * @return {String}
         */
        escapeFor: function (that, language) {
            var replacements = _escapes[language];
            if (undefined !== replacements) {
                that = gpf.replaceEx(that, replacements);
                if ("javascript" === language) {
                    that = "\"" + that + "\"";
                    /* TODO: handle UNICODE characters
                     l = t.length;
                     r = [];
                     for( i = 0; i < l ; ++i )
                     {
                     c = t.charCodeAt( i );
                     if( c < 128 )
                     r.push( String.fromCharCode( c ) );
                     else
                     r.push( "&#" + c + ";" );
                     }
                     return r.join("");
                     */
                }
            }
            return that;
        },

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
         * @event data finished reading the stream, the buffer is provided
         * @eventParam {String} buffer
         *
         */
        stringFromStream: function (stream, eventsHandler) {
            if (stream instanceof StringStream) {
                gpfFireEvent.apply(this, [
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

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/