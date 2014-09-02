/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    gpf.html = {};

    var
        gpfI = gpf.interfaces;

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

            /**
             * Name of the file
             *
             * @return {String}
             */
            name: function () {
                return this._file.name;
            },

            /**
             * Size of the file
             *
             * @return {Number}
             */
            size: function () {
                return this._file.size;
            },

            /**
             * @implements gpf.interfaces.ITextStream:read
             * @closure
             */
            read: function(count, eventsHandler) {
                var
                    that = this,
                    reader = this._reader,
                    left = this._file.size - this._pos,
                    blob;
                if (0 === left) {
                    gpf.defer(gpf.events.fire, 0, this, [
                        gpfI.IReadableStream.EVENT_END_OF_STREAM,
                        eventsHandler
                    ]);
                    return;
                }
                this._eventsHandler = eventsHandler;
                if (null === reader) {
                    reader = this._reader = new FileReader();
                    reader.onloadend = function (event) {
                        that._onLoadEnd(event);
                    };
                }
                if (0 === count || count > left) {
                    count = left;
                }
                blob = this._file.slice(this._pos, count);
                this._pos += count;
                reader.readAsArrayBuffer(blob);
            }

        },

        private: {

            /**
             * @type {File}
             * @private
             */
            _file: null,

            /**
             * @type {FileReader}
             * @private
             */
            _reader: null,

            /**
             * @type {Number}
             * @private
             */
            _pos: 0,

            /**
             * @type {gpf.events.Handler}
             * @private
             */
            _eventsHandler: null,

            /**
             * Wrapper for the onloadend event handler
             *
             * @param {DOM Event} event
             * @private
             */
            _onLoadEnd: function (event) {
                var
                    reader = event.target,
                    buffer,
                    len,
                    result,
                    idx;
                gpf.ASSERT(reader === this._reader,
                    "Unexpected change of reader");
                if (reader.error) {
                    gpf.events.fire.apply(this, [
                        gpfI.IReadableStream.ERROR,
                        {
                            // According to W3C
                            // http://www.w3.org/TR/domcore/#interface-domerror
                            error: {
                                name: reader.error.name,
                                message: reader.error.message
                            }
                        },
                        this._eventsHandler
                    ]);
                } else if (reader.readyState === FileReader.DONE) {
                    buffer = new Int8Array(reader.result);
                    len = buffer.length;
                    result = [];
                    for (idx = 0; idx < len; ++idx) {
                        result.push(buffer[idx]);
                    }
                    gpf.events.fire.apply(this, [
                        gpfI.IReadableStream.EVENT_DATA,
                        {
                            buffer: result
                        },
                        this._eventsHandler
                    ]);
                }
            }
        }

    });

    //region HTML Attributes

    var
        /**
         * HTML attribute (base class).
         *
         * @class gpf.attributes.HtmlAttribute
         * @extends gpf.attributes.Attribute
         * @private
         */
        _Base = gpf._defAttr("HtmlAttribute", {}),

        /**
         * HTML Handler
         * Used to identify the member receiving the attached DOM inside an
         * object
         *
         * @class gpf.attributes.HtmlHandlerAttribute
         * @extends gpf.attributes.HtmlAttribute
         * @alias gpf.$HtmlHandler
         * @friend _handleHandlers
         * @friend _handleEvent
         */
        _Handler = gpf._defAttr("$HtmlHandler", _Base, {

            private: {

                _selector: "",
                _globalSelector: false

            },

            protected: {

                /**
                 * Apply selection starting from the provided object
                 *
                 * @param {Object} domObject
                 * @returns {Object|undefined}
                 * @private
                 */
                _select: function (domObject) {
                    var selector = this._selector;
                    if (selector) {
                        if (this._globalSelector) {
                            return document.querySelector(selector);
                        } else {
                            return domObject.querySelector(selector);
                        }
                    }
                    return undefined;
                }

            },

            public: {

                /**
                 * @constructor
                 * @param {String} [selector=undefined] selector
                 * @param {Boolean} [global=false] global
                 */
                constructor: function (selector, global) {
                    if (selector) {
                        this._selector = selector;
                    }
                    if (undefined !== global) {
                        this._globalSelector = global === true;
                    }
                }

            }

        }),

        /**
         * HTML Event Mapper
         *
         * @class gpf.attributes.HtmlEventAttribute
         * @extends gpf.attributes.HtmlHandlerAttribute
         * @alias gpf.$HtmlEvent
         * @friend _handleEvent
         */
        _Event = gpf._defAttr("$HtmlEvent", _Handler, {

            private: {

                _event: ""

            },

            public: {

                /**
                 * @constructor
                 * @param {String} event
                 * @param {String} [selector=undefined] selector
                 * @param {Boolean} [global=false] global
                 */
                constructor: function (event, selector, global) {
                    _Handler.apply(this,[selector, global]);
                    this._event = event;
                }

            }

        });

    //endregion

    //region HTML event handlers mappers through attributes

    function _getHandlerAttribute(member, handlerAttributeArray) {
        var attribute;
        if (1 !== handlerAttributeArray.length()) {
            gpf.Error.HtmlHandlerMultiplicityError({
                member: member
            });
        }
        attribute = handlerAttributeArray.get(0);
        if (!(attribute instanceof _Event)) {
            return attribute;
        }
        return null;
    }

    function _findDefaultHandler(member, handlerAttributeArray) {
        var
            attribute = _getHandlerAttribute(member, handlerAttributeArray);
        if (attribute && !attribute._selector) {
            return attribute;
        }
    }

    /**
     * Attach the selected DOM object to the object instance
     *
     * @param {Object} instance Object instance
     * @param {String|Object} [domSelection=undefined] domSelection DOM
     * selector, DOM object or nothing. If a DOM selector or object is provided
     * it will be associated to the object using the default $HtmlHandler
     * attribute.
     * Otherwise, this can be used to refresh the missing associations.
     *
     * @return {Object|undefined} the DOM object
     * @closure
     */
    gpf.html.handle = function (instance, domSelection) {
        var
            allAttributes = new gpf.attributes.Map(instance).filter(_Base),
            handlerAttributes = allAttributes.filter(_Handler),
            defaultHandler,
            eventAttributes;
        if (0 === handlerAttributes.count()) {
            gpf.Error.HtmlHandlerMissing();
        }
        defaultHandler = handlerAttributes.each(_findDefaultHandler);
        if (undefined === defaultHandler) {
            gpf.Error.HtmlHandlerNoDefault();
        }
        defaultHandler = defaultHandler.member();
        if (undefined === domSelection) {
            domSelection = instance[defaultHandler];
            gpf.ASSERT(domSelection, "Handle not previously set");
        } else {
            if ("string" === typeof domSelection) {
                domSelection = document.querySelector(domSelection);
            }
            gpf.ASSERT(domSelection, "Selector does not resolve to DOM");
            if (!domSelection) {
                return; // Nothing can be done
            }
            instance[defaultHandler] = domSelection;
        }
        // Process other handlers
        handlerAttributes.each(_handleHandlers, instance, [domSelection]);
        // Process event handlers
        eventAttributes = allAttributes.filter(_Event);
        if (0 < eventAttributes.count()) {
            eventAttributes.each(_handleEvents, instance, [domSelection]);
        }
        return domSelection;
    };

    function _handleHandlers(member, handlerAttributeArray, domObject) {
        /*jshint -W040*/ // Used as a callback, this is the object instance
        var
            attribute = _getHandlerAttribute(member, handlerAttributeArray);
        if (!attribute || !attribute._selector) {
            return;
        }
        domObject = attribute._select(domObject);
        if (!domObject) {
            return;
        }
        this[member] = domObject;
        /*jshint +W040*/
    }

    /**
     * @param {String} member
     * @param {gpf.attributes.Array} attributesArray
     * @param {Object} domObject
     * @private
     */
    function _handleEvents(member, attributesArray, domObject) {
        /*jshint -W040*/ // Used as a callback, this is the object instance
        attributesArray.each(_handleEvent, this, [member, domObject]);
        /*jshint +W040*/
    }

    /**
     * @param {gpf.attributes.HtmlEventAttribute} eventAttribute
     * @param {String} member
     * @param {Object} domObject
     * @private
     */
    function _handleEvent(eventAttribute, member, domObject) {
        /*jshint -W040*/ // Used as a callback, this is the object instance
        var
            event = eventAttribute._event,
            _boundMember = member + ":$HtmlEvent(" + event + ","
                + eventAttribute._selector + ")";
        domObject = eventAttribute._select(domObject);
        if (!domObject) {
            return; // Nothing to do
        }
        if (!this[_boundMember]) {
            domObject.addEventListener(event, gpf.Callback.bind(this, member));
            this[_boundMember] = true;
        }
        /*jshint +W040*/
    }

    //endregion

    //region Common HTML helpers

    gpf.extend(gpf.html, {

        /**
         * Check if the DOM object has the requested class name(s)
         *
         * @param {Object} domObject
         * @param {String|String[]} toCheck
         * @return {Boolean}
         * @chainable
         */
        hasClass: function (domObject, toCheck) {
            var
                classNames,
                len,
                idx;
            if ("string" === typeof toCheck) {
                toCheck = [toCheck];
            }
            gpf.ASSERT(toCheck instanceof Array, "Expected array");
            classNames = domObject.className.split(" ");
            len = toCheck.length;
            for (idx = 0; idx < len; ++idx) {
                if (undefined !== gpf.test(classNames, toCheck[idx])) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Add the provided class name(s) to the DOM object
         *
         * @param {Object} domObject
         * @param {String|String[]} toAdd
         * @return {Object}
         * @chainable
         */
        addClass: function (domObject, toAdd) {
            var
                classNames,
                lengthBeforeAdding,
                len,
                idx;
            if ("string" === typeof toAdd) {
                toAdd = [toAdd];
            }
            gpf.ASSERT(toAdd instanceof Array, "Expected array");
            classNames = domObject.className.split(" ");
            lengthBeforeAdding = classNames.length;
            len = toAdd.length;
            for (idx = 0; idx < len; ++idx) {
                gpf.set(classNames, toAdd[idx]);
            }
            // Avoid resource consuming refresh if nothing changed
            if (lengthBeforeAdding !== classNames.length) {
                domObject.className = classNames.join(" ");
            }
            return domObject;
        },

        /**
         * Remove the provided class name(s) to the DOM object
         *
         * @param {Object} domObject
         * @param {String|String[]} toRemove
         * @return {Object}
         * @chainable
         */
        removeClass: function (domObject, toRemove) {
            var
                classNames,
                lengthBeforeAdding,
                len,
                idx;
            if ("string" === typeof toRemove) {
                toRemove = [toRemove];
            }
            gpf.ASSERT(toRemove instanceof Array, "Expected array");
            classNames = domObject.className.split(" ");
            lengthBeforeAdding = classNames.length;
            len = toRemove.length;
            for (idx = 0; idx < len; ++idx) {
                gpf.clear(classNames, toRemove[idx]);
            }
            // Avoid resource consuming refresh if nothing changed
            if (lengthBeforeAdding !== classNames.length) {
                domObject.className = classNames.join(" ");
            }
            return domObject;
        }

    });

    //endregion

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/