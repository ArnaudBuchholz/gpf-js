/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    var
        gpfI = gpf.interfaces,
        _MARKDOWN_BUFFER_SIZE        = 256,
        _MARKDOWN_ISTATE_INIT        = 0,
        _MARKDOWN_ISTATE_INPROGRESS  = 1,
        _MARKDOWN_ISTATE_WAITING     = 2,
        _MARKDOWN_ISTATE_EOS         = 3;

    gpf.html = {};

    /**
     * Markdown to HTML converter using ReadableStream interface
     * Inspired from http://en.wikipedia.org/wiki/Markdown
     *
     * @class gpf.html.MarkdownConverter
     * @implements gpf.interfaces.IReadableStream
     */
    gpf.define("gpf.html.MarkdownConverter", "gpf.Parser", {

        "[Class]": [gpf.$InterfaceImplement(gpfI.IReadableStream)],

        public: {

            /**
             * @param {gpf.interfaces.IReadableStream} input
             */
            constructor: function (input) {
                this._iStream = gpfI.query(input, gpfI.IReadableStream, true);
                this._outputBuffer = [];
                this.setParserState(this._parseInit);
            },

            //region gpf.interfaces.IReadableStream

            /**
             * @implements gpf.interfaces.IReadableStream:read
             */
            read: function (size, eventsHandler) {
                var
                    iState = this._iState,
                    buffer,
                    length = this._outputBufferLength;
                if (_MARKDOWN_ISTATE_INPROGRESS === iState) {
                    // A read call is already in progress
                    throw gpfI.IReadableStream.EXCEPTION_READ_IN_PROGRESS;

                } else if (size < length
                    || length && _MARKDOWN_ISTATE_EOS === iState) {
                    // Enough chars in the output buffer to do the read
                    // OR there won't be any more chars
                    buffer = this._outputBuffer.shift();
                    length = buffer.length;
                    if (size && size < length) {
                        // More than requested, enqueue the extra chars
                        this._outputBuffer.unshift(buffer.substr(size));
                        buffer = buffer.substr(0, size);
                        length = size;
                    }
                    this._outputBufferLength -= length;
                    // Can output something
                    gpf.events.fire(gpfI.IReadableStream.EVENT_DATA, {
                        buffer: buffer
                    }, eventsHandler);

                } else if (_MARKDOWN_ISTATE_EOS === iState) {
                    // No more input and output buffer is empty
                    gpf.events.fire(gpfI.IReadableStream.EVENT_END_OF_STREAM,
                        eventsHandler);

                } else {
                    // Read input
                    if (_MARKDOWN_ISTATE_INIT === this._iState) {
                        // Very first call, create callback for input reads
                        this._cbRead = new gpf.Callback(this._onRead, this);
                    }
                    this._iState = _MARKDOWN_ISTATE_INPROGRESS;
                    // Backup parameters
                    this._size = size;
                    this._eventsHandler = eventsHandler;
                    this._iStream.read(_MARKDOWN_BUFFER_SIZE, this._cbRead);
                }
            }

            //endregion
        },

        //region Implementation

        private: {

            /**
             * Input stream
             * @type {gpf.interfaces.IReadableStream}
             */
            _iStream: null,

            /**
             * Input stream read callback (pointing to this:_onRead)
             * @type {gpf.Callback}
             */
            _cbRead: null,

            /**
             * Output buffer, contains decoded items
             * @type {String[]}
             */
            _outputBuffer: [],

            /**
             * Size of the output buffer (number of characters)
             * @type {Number}
             */
            _outputBufferLength: 0,

            /**
             * Input state
             * @type {Number} see _MARKDOWN_ISTATE_xxx
             */
            _iState: _MARKDOWN_ISTATE_INIT,

            /**
             * Pending read call size
             * @type {Number}
             */
            _size: 0,

            /**
             * Pending read call event handlers
             * @type {gpf.events.Handler}
             */
            _eventsHandler: null,

            /**
             * Handles input stream read event
             *
             * @param {gpf.events.Event} event
             * @private
             */
            _onRead: function (event) {
                var
                    type = event.type();
                if (type === gpfI.IReadableStream.EVENT_END_OF_STREAM) {
                    this._iState = _MARKDOWN_ISTATE_EOS;
                    // Redirect to read with backed parameters
                    return this.read(this._size, this._eventsHandler);

                } else if (type === gpfI.IReadableStream.EVENT_ERROR) {
                    // Forward the event
                    gpf.events.fire(event, this._eventsHandler);
                    
                } else {
                    this._iState = _MARKDOWN_ISTATE_WAITING;
                    this.parse(event.get("buffer"));
                }
            },

            /*
             * 'Grammar'
             * init
             *      : '\n' init
             *      | '#' title1
             *      | '*' list
             *      | ' ' init
             *      | content
             *
             * title1
             *      : '#' title2
             *      | text \n
             * title2
             *      : '#' title3
             *      | text \n
             * title3
             *       : text \n
             *
             * list
             *      : ' ' content // confirmed
             *      | content
             *
             * content
             *      : '\n' init
             *      | '*' italic
             *      | '`' monospace
             *      | '[' link
             *      | '&' content
             *      | '<' content
             *      | '>' content
             *      | content
             *
             * italic
             *      : '*' text '*' '*' // bold
             *      : text '*' // italic
             *
             * monospace
             *      : text '`'
             *
             * link
             *      : (text) ']' '(' url ')'
             */

            _pTagOpened: false,
            _numberOfNL: 0,

            /**
             * init
             * @param {String} char
             * @private
             */
            _parseInit: function (char) {
                var
                    closeP = false;
                if ("\n" === char) {
                    // If the second time and a <p> is opened, close it
                    if (2 === ++this._numberOfNL && this._pTagOpened) {
                        closeP = true;
                    }
                    // this._pState = this._parseInit;
                } else if ("#" === char) {
                    // If a <p> is opened, close it
                    closeP = true;
                    this._hLevel = 1;
                    this._pState = this._parseTitle;
                } else if ("*" === char) {
                    // If a <p> is opened, close it
                    closeP = true;
                    this._pState = this._parseList;
                } else if (" " === char || "\t" === char) {
                    ++this._indentLevel;
                    // this._pState = this._pStateInit;
                } else {
                    // If no <p> and - at least - two \n were used, open one
                    if (1 < this._numberOfNL) {
                        this._output("<p>");
                        this._pTagOpened = true;
                    }
                    this._parseContent(char);
                }
                if (closeP) {
                    this._output("</p>");
                    this._pTagOpened = false;
                }
            },

            _hLevel: 1,

            /**
             * title1, ... N
             * @param {String} char
             * @private
             */
            _parseTitle: function (char) {
                if ("#" === char) {
                    ++this._hLevel;
//                    this._pState = this._parseTitle;
                } else {
                    this._output("<h" + this._hLevel + ">");
                    this._pState = this._parseText;
                }
            },

            /**
             * list
             * @param {String} char
             * @private
             */
            _parseList: function (char) {
                if (" " === char) {
                    // Start or append list
                    // Use column to know which list
                }
                this._pState = this._parseContent;
            },

            _parseContent: function (char) {

            },

            /**
             * Enqueue the html in the output buffer
             *
             * @param {String} html
             * @private
             */
            _output: function (html) {
                this._outputBuffer.push(html);
                this._outputBufferLength += html.length;
            }

        },

        protected: {

            //region Parser configuration
            _ignoreCarriageReturn: true

        }

        //endregion
    });

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/