(function () { /* Begin of privacy scope */
    /*global document,window,console*/
    /*global process,require,exports,global*/
    /*global gpf*/
    /*jslint continue: true, nomen: true, plusplus: true*/
    "use strict";

    var
        _escapes = {

            jscript: {
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

        _stringStream = gpf.Class.extend({

            "[Class]": [gpf.$InterfaceImplement(gpf.interfaces.ITextStream)],

            _buffer: [],
            _pos: 0,

            init: function(string){
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
                    if (count > length - pos) {
                        count = length - pos;
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
            write: function(buffer) {
                this._buffer.push(buffer);
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

        "[replaceEx]": [ gpf.$ClassExtension(String) ],
        /**
         * Substitutes all occurrences of the keys found in the replacements
         * object with their values
         *
         * @param {string} that
         * @param {object} replacements map of strings to search and replace
         * @returns {string}
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

        "[escapeFor]": [ gpf.$ClassExtension(String) ],
        /**
         * Adapt the string content to be compatible with the provided language
         *
         * @param {string} that
         * @param {string} language
         * @returns {string}
         */
        escapeFor: function (that, language) {
            var replacements = _escapes[language];
            if (undefined !== replacements) {
                that = gpf.replaceEx(that, replacements);
                if ("jscript" === language) {
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

        "[stringToStream]": [
            gpf.$ClassExtension(String, "toStream")
        ],

        /**
         * Converts the string into a stream
         *
         * @param {string} that
         * @returns {gpf.interfaces.ITextStream}
         */
        stringToStream: function (that) {
            return new _stringStream(that);
        },

        "[stringFromStream]": [
            gpf.$ClassExtension(String, "fromStream")
        ],

        /**
         * Converts the stream into a string
         *
         * @param {gpf.interfaces.ITextStream} stream
         */
        stringFromStream: function (stream) {
            if (stream instanceof _stringStream) {
                return stream.consolidateString();
            } else {
                // READ and join...
                throw "Not implemented";
            }
        }

    });

}()); /* End of privacy scope */
