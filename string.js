/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    var
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
                "é": "&eacute;",
                "è": "&egrave;",
                "ê": "&ecirc;",
                "á": "&aacute;",
                "à": "&agrave;"
            }

        },

        /**
         * Implements ITextStream on top of a stream
         *
         * @class StringStream
         * @implements gpf.interfaces.ITextStream
         * @private
         */
        StringStream = gpf.define("StringStream", {

            "[Class]": [gpf.$InterfaceImplement(gpf.interfaces.ITextStream)],

            _buffer: [],
            _pos: 0,

            constructor: function(string){
                if (undefined !== string && string.length) {
                    this._buffer = [string];
                } else {
                    this._buffer = [];
                }
                this._pos = 0;
            },

            //region gpf.interfaces.ITextStream

            /**
             * @implements gpf.interfaces.ITextStream:read
             */
            read: function(count) {
                // FIFO
                var
                    firstBuffer,
                    length,
                    result;
                if (0 === this._buffer.length) {
                    return null;
                } else {
                    firstBuffer = this._buffer[0];
                    length = firstBuffer.length;
                    if (count > length - this._pos) {
                        count = length - this._pos;
                    }
                    result = firstBuffer.substr(this._pos, count);
                    this._pos += count;
                    if (this._pos === length) {
                        this._buffer.shift();
                        this._pos = 0;
                    }
                    return result;
                }
            },

            /**
             * @implements gpf.interfaces.ITextStream:write
             */
            write: gpf.interfaces.ITextStream._write,

            write_: function (buffer) {
                if (null === buffer) {
                    this._buffer = [];
                    this._pos = 0;
                } else {
                    this._buffer.push(buffer);
                }
            },

            //endregion

            /**
             * Consolidate the result string
             */
            consolidateString: function() {
                if (this._pos !== 0) {
                    this._buffer.unshift(
                        this._buffer.shift().substr(this._pos));
                }
                return this._buffer.join("");
            }

        });

    gpf.extend(gpf, {

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

        "[stringFromStream]": [gpf.$ClassExtension(String, "fromStream")],

        /**
         * Converts the stream into a string
         *
         * @param {gpf.interfaces.ITextStream} stream
         * @return {String}
         */
        stringFromStream: function (stream) {
            if (stream instanceof StringStream) {
                return stream.consolidateString();
            } else {
                // READ and join...
                gpf.NOT_IMPLEMENTED();
                return null;
            }
        }

    });

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/