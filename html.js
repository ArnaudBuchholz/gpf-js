/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    gpf.html = {};

    /**
     * Markdown to HTML converter using Parser interface
     * Inspired from http://en.wikipedia.org/wiki/Markdown
     *
     * Weak -but working- implementation
     *
     * @class gpf.html.MarkdownParser
     */
    gpf.define("gpf.html.MarkdownParser", "gpf.Parser", {

        public: {
            constructor: function () {
                this._baseConstructor(arguments);
                this._openedTags = [];
            }
        },

    /*
     * 'Grammar'
     * init
     *      : '\n' init
     *      | '#' title1
     *      | '*' list
     *      | '0'...'9' list
     *      | ' ' init
     *      | content
     *
     * title1
     *      : '#' title2
     *      | text \n init
     * title2
     *      : '#' title3
     *      | text \n init
     * title3
     *       : text \n init
     *
     * list
     *      : ' ' content // confirmed
     *      | '0'...'9' list // If started with '0'...'9'
     *      | '.' content // confirmed, if started with '0'...'9'
     *      | '*' text '*' '*' // bold
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
     *      | '-' escape
     *      | content
     *
     * escape
     *      : '-' '-' content
     *
     * italic
     *      : '*' content '*' '*' // bold
     *      : content '*' // italic
     *
     * monospace
     *      : content '`'
     *
     * link
     *      : (text) ']' '(' url ')'
     */

        protected: {

            //region Parser configuration
            _ignoreCarriageReturn: true, // \r

            /**
             * Initial state
             *
             * @param {String} char
             * @protected
             */
            _initialParserState: function (char) {
                var
                    newState,
                    tagsOpened = 0 < this._openedTags.length;
                if ("#" === char) {
                    this._hLevel = 1;
                    newState = this._parseTitle;
                } else if ("*" === char || "0" <= char && "9" >= char ) {
                    if (char !== "*") {
                        this._numericList = 1;
                    } else {
                        this._numericList = 0;
                    }
                    newState = this._parseList;
                    tagsOpened = false; // Wait for disambiguation
                } else if (" " !== char && "\t" !== char && "\n" !== char) {
                    if (tagsOpened) {
                        this._output(" ");
                        tagsOpened = false; // Avoid closing below
                    } else {
                        this._openTag("p");
                    }
                    newState = this._parseContent(char);
                    if (!newState) {
                        newState = this._parseContent;
                    }
                }
                if (tagsOpened) {
                    this._closeTags();
                }
                return newState;
            },

            /**
             * @inheritdoc gpf.Parser:_finalizeParserState
             * @protected
             */
            _finalizeParserState: function () {
                this._closeTags();
            }

        },

        private: {

            /**
             * Stack of opened tags
             *
             * @type {String[}}
             * @private
             */
            _openedTags: [],

            /**
             * Close all opened tags
             *
             * @private
             */
            _closeTags: function () {
                var
                    tag;
                while (this._openedTags.length) {
                    tag = this._openedTags.pop();
                    this._output("</" + tag + ">");
                    if ("p" === tag) {
                        break;
                    }
                }
            },

            /**
             * Open (or concatenate) a list tag. This includes closing previous
             * list item (if any)
             *
             * @param {String} listTag
             * @private
             */
            _openList: function (listTag) {
                var
                    tag,
                    len = this._openedTags.length;
                while (len) {
                    tag = this._openedTags.pop();
                    --len;
                    this._output("</" + tag + ">");
                    if ("li" === tag) {
                        break;
                    }
                }
                if (len) {
                    tag = this._openedTags[len - 1];
                    if (tag !== listTag) {
                        this._openedTags.pop();
                        this._output("</" + tag + ">");
                    } else {
                        return;
                    }
                }
                this._openTag(listTag);
            },

            /**
             * Open/Close tag depending if it has been opened previously (if it
             * appears as the top tag on the stacked items)
             *
             * @param {String} tag
             * @private
             */
            _toggleTag: function (tag) {
                var
                    len = this._openedTags.length;
                if (len && this._openedTags[len - 1] === tag) {
                    this._openedTags.pop();
                    this._output("</" + tag + ">");
                } else {
                    this._openTag(tag);
                }
            },

            /**
             * Open a tag (and adds it to the stack)
             *
             * @param {String} tag
             * @private
             */
            _openTag: function (tag) {
                this._output("<" + tag + ">");
                this._openedTags.push(tag);
            },

            /**
             * H level (number of times the # char has been found)
             *
             * @type {Number}
             * @private
             */
            _hLevel: 1,

            /**
             * States title1, ... N
             *
             * @param {String} char
             * @private
             */
            _parseTitle: function (char) {
                if ("#" === char) {
                    ++this._hLevel;
                } else {
                    this._openTag("h" + this._hLevel);
                    return this._parseText; // No formatting allowed in Hx
                }
            },

            /**
             * Indicates a numeric list element has been found
             *
             * @type {Boolean}
             * @private
             */
            _numericList: false,

            /**
             * State list
             * TODO: numbered list parsing is incorrect
             *
             * @param {String} char
             * @private
             */
            _parseList: function (char) {
                var
                    tagsOpened = 0 < this._openedTags.length,
                    listTag;
                if (" " === char) {
                    // Start or append list
                    if (this._numericList) {
                        listTag = "ol";
                    } else {
                        listTag = "ul";
                    }
                    this._openList(listTag);
                    this._openTag("li");
                } else if (this._numericList
                    && ("0" <= char && "9" >= char || "." === char)) {
                    return; // No state change
                } else if ("*" === char) {
                    if (tagsOpened) {
                        this._output(" "); // new line inside a paragraph
                    }
                    this._openTag("strong");
                }
                return this._parseContent;
            },

            /**
             * Handles <, > and & HTML entities
             *
             * @param {String} char
             * @returns {boolean} The character has been processed
             * @private
             */
            _handleEntities: function (char) {
                if ("<" === char) {
                    this._output("&lt;");
                } else if (">" === char) {
                    this._output("&gt;");
                } else if ("&" === char) {
                    this._output("&amp;");
                } else {
                    return false;
                }
                return true;
            },

            /**
             * Escape character
             *
             * @type {String}
             * @private
             */
            _escapeChar: "",

            /**
             * Escape character count
             *
             * @type {Number}
             * @private
             */
            _escapeCount: 0,

            /**
             * State escape
             *
             * @param {String} char
             * @private
             */
            _parseEscape: function (char) {
                var
                    escapeChar = this._escapeChar,
                    count;
                if (char === escapeChar) {
                    count = ++this._escapeCount;
                    if ("-" === escapeChar && 3 === count) {
                        this._output("&mdash;");
                        return this._parseContent;
                    }
                } else {
                    count = this._escapeCount + 1;
                    while (--count) {
                        this._output(escapeChar);
                    }
                    this._setParserState(this._parseContent);
                    return this._parseContent(char);
                }
            },

            /**
             * State content
             *
             * @param {String} char
             * @private
             */
            _parseContent: function (char) {
                if (this._handleEntities(char)) {
                    return;
                }
                if ("*" === char) {
                    return this._parseItalic;
                } else if ("`" === char) {
                    this._toggleTag("code");
                    return;
                } else if ("[" === char) {
                    this._linkState = 0;
                    this._linkText = [];
                    this._linkUrl = [];
                    return this._parseLink;
                } else if ("-" === char) {
                    this._escapeCount = 1;
                    this._escapeChar = "-";
                    return this._parseEscape;
                } else if ("\n" === char) {
                    return null;
                } else {
                    this._output(char);
                }
            },

            /**
             * State italic
             *
             * @param {String} char
             * @private
             */
            _parseItalic: function (char) {
                if ("*" === char) {
                    this._toggleTag("strong");
                } else {
                    this._toggleTag("em");
                    this._output(char);
                }
                return this._parseContent;
            },

            /**
             * State text
             *
             * @param {String} char
             * @private
             */
            _parseText: function (char) {
                if (this._handleEntities(char)) {
                    return;
                }
                if ("\n" === char) {
                    // Ignore any formatting until \n
                    this._closeTags();
                    return null;
                } else {
                    this._output(char);
                }
            },

            _linkText: [],
            _linkUrl: [],
            _linkState: 0,

            /**
             * State link
             * TODO improve?
             *
             * @param {String} char
             * @private
             */
            _parseLink: function (char) {
                var
                    linkState = this._linkState;
                if ("]" === char && 0 === linkState) {
                    ++this._linkState;
                } else if ("(" === char && 1 === linkState) {
                    ++this._linkState;
                } else if (")" === char && 2 === linkState) {
                    this._output("<a href=\"");
                    this._output(this._linkUrl.join(""));
                    this._output("\">");
                    this._output(this._linkText.join(""));
                    this._output("</a>");
                    return this._parseContent;
                } else if (0 === linkState) {
                    this._linkText.push(char);
                } else if (2 === linkState) {
                    this._linkUrl.push(char);
                }
                // Else... nothing. do some kind of error handling?
            }
        }

    });

    /**
     * HTML5 File to ReadableStream wrapper
     */
    gpf.define("gpf.html.File", {

        "[Class]": [gpf.$InterfaceImplement(gpf.interfaces.ITextStream)],

        public: {

            constructor: function (file) {
                this._file = file;
            },

            name: function () {
                return this._file.name;
            },

            size: function () {
                return this._file.size;
            },

            /**
             * @implements gpf.interfaces.ITextStream:read
             */
            read: function(count, eventsHandler) {
                var
                    reader = this._reader,
                    blob;
                if (null === reader) {
                    reader = this._reader = new FileReader();
                    this._reader._gpf = this;
                    reader.onloadend = gpf.html.File._onLoadEnd;
                }
                blob = this._file.slice(offset, offset + chunkSize);
                reader.readAsArrayBuffer(blob);


//                // FIFO
//                var
//                    firstBuffer,
//                    length,
//                    result;
//                if (0 === this._buffer.length) {
//                    gpf.defer(gpf.events.fire, 0, this, [
//                        gpfI.IReadableStream.EVENT_END_OF_STREAM,
//                        eventsHandler
//                    ]);
//                } else if (undefined === count) {
//                    gpf.defer(gpf.events.fire, 0, this, [
//                        gpfI.IReadableStream.EVENT_DATA,
//                        {
//                            buffer: this.consolidateString()
//                        },
//                        eventsHandler
//                    ]);
//                } else {
//                    firstBuffer = this._buffer[0];
//                    length = firstBuffer.length;
//                    if (count > length - this._pos) {
//                        count = length - this._pos;
//                    }
//                    result = firstBuffer.substr(this._pos, count);
//                    this._pos += count;
//                    if (this._pos === length) {
//                        this._buffer.shift();
//                        this._pos = 0;
//                    }
//                    gpf.defer(gpf.events.fire, 0, this, [
//                        gpfI.IReadableStream.EVENT_DATA,
//                        {
//                            buffer: result
//                        },
//                        eventsHandler
//                    ]);
//                }
            }

        },

        private: {

            /**
             * @type {File}
             */
            _file: null,

            /**
             * @type {FileReader}
             */
            _reader: null,

            /**
             * @type {gpf.events.Handler}
             */
            _eventsHandler: null,

            _onLoadEnd: function (event) {
                if (event.target.readyState === FileReader.DONE) { // DONE == 2
                    var buffer = new Int8Array(event.target.result);

                    task.resolve(buffer, chunkSize);
                } else {
                    //...
                }
            }

        },

        static: {

            _onLoadEnd: function (event) {
                var that = event.target._gpf;
                that._onLoadEnd(event);
            }
        }

    });

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/