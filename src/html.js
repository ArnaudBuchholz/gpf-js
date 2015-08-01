/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
"use strict";
/*global _GPF_HOST_BROWSER*/ // gpf.HOST_BROWSER
/*global _GPF_HOST_PHANTOMJS*/ // gpf.HOST_PHANTOMJS
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfExtend*/ // gpf.extend
/*#endif*/

    _gpfErrorDeclare("html", {
        "HtmlHandlerMultiplicityError":
            "Too many $HtmlHandler attributes for '{member}'",
        "HtmlHandlerMissing":
            "No $HtmlHandler attributes",
        "HtmlHandlerNoDefault":
            "No default $HtmlHandler attribute"
    });

    gpf.html = {

        // DOM standards
        ELEMENT_NODE: 1,
        TEXT_NODE: 3

    };

    var
        gpfI = gpf.interfaces,
        gpfFireEvent = gpf.events.fire;

    /**
     * Markdown to HTML converter using Parser interface
     * Inspired from http://en.wikipedia.org/wiki/Markdown,
     * improved with http://daringfireball.net/projects/markdown/syntax
     *
     * Weak -but working- implementation
     *
     * @class gpf.html.MarkdownParser
     */
    _gpfDefine("gpf.html.MarkdownParser", "gpf.Parser", {

        public: {

            /**
             * @constructor
             */
            constructor: function () {
                this._super.apply(this, arguments);
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
     *      | '!' image (if followed by '[')
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
     *      : (text) '`'
     *
     * link
     *      : (text) ']' '(' (text) ')'
     *
     * image
     *      : '[' link
     *      : content
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
             * @return {boolean} The character has been processed
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
                    return this._parseMonospace;
                } else if ("[" === char) {
                    return this._startLink(0);
                } else if ("!" === char) {
                    return this._parseImage;
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

            /**
             * State monospace
             *
             * @param {String} char
             * @private
             */
            _parseMonospace: function (char) {
                if ("`" === char) {
                    this._toggleTag("code");
                    return this._parseContent;
                } else {
                    this._output(char);
                }
            },

            /**
             * 0 for A, 1 for IMG
             *
             * @type {Number}
             * @private
             */
            _linkType: 0,

            /**
             * 0: in text
             * 1: ], waiting for (
             * 2: in url
             *
             * @type {Number}
             * @private
             */
            _linkState: 0,

            /**
             * Link text
             *
             * @type {String[]}
             * @private
             */
            _linkText: [],

            /**
             * Link url
             *
             * @type {String[]}
             * @private
             */
            _linkUrl: [],

            /**
             * Prepare a link parsing
             *
             * @return {Function}
             * @private
             */
            _startLink: function (type) {
                this._linkType = type;
                this._linkState = 0;
                this._linkText = [];
                this._linkUrl = [];
                return this._parseLink;
            },

            /**
             * Finalize link parsing
             *
             * @return {Function}
             * @private
             */
            _finishLink: function () {
                var
                    url = this._linkUrl.join(""),
                    text = this._linkText.join("");
                if (0 === this._linkType) {
                    this._output("<a href=\"");
                    this._output(url);
                    this._output("\">");
                    this._output(text);
                    this._output("</a>");
                } else if (1 ===  this._linkType) {
                    this._output("<img src=\"");
                    this._output(url);
                    this._output("\" alt=\"");
                    this._output(text);
                    this._output("\" title=\"");
                    this._output(text);
                    this._output("\">");
                }
                return this._parseContent;
            },

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
                    return this._finishLink();
                } else if (0 === linkState) {
                    this._linkText.push(char);
                } else if (2 === linkState) {
                    /*
                     * https://github.com/ArnaudBuchholz/gpf-js/issues/33
                     * Filter out tabs and carriage returns
                     */
                    if (-1 === "\t\n".indexOf(char)) {
                        this._linkUrl.push(char);
                    }
                }
                // Else... nothing. do some kind of error handling?
            },

            /**
             * State image
             *
             * @param {String} char
             * @private
             */
            _parseImage: function (char) {
                if ("[" === char) {
                    return this._startLink(1);
                } else {
                    this._output("!");
                    this._setParserState(this._parseContent);
                    return this._parseContent(char);
                }
            }
        }

    });

    /**
     * HTML5 File to ReadableStream wrapper
     */
    _gpfDefine("gpf.html.File", {

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
                    gpfFireEvent.apply(this, [
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
                    gpfFireEvent.apply(this, [
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
                    gpfFireEvent.apply(this, [
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
        _HtmBase = gpf._defAttr("HtmlAttribute", {}),

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
        _HtmHandler = gpf._defAttr("$HtmlHandler", _HtmBase, {

            private: {

                _selector: "",
                _globalSelector: false

            },

            protected: {

                /**
                 * Apply selection starting from the provided object
                 *
                 * @param {Object} domObject
                 * @return {Object|undefined}
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
        _HtmEvent = gpf._defAttr("$HtmlEvent", _HtmHandler, {

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
                    _HtmHandler.apply(this,[selector, global]);
                    this._event = event;
                }

            }

        });

    //endregion

    //region HTML event handlers mappers through attributes

    function _getHandlerAttribute(member, handlerAttributeArray) {
        var attribute;
        if (1 !== handlerAttributeArray.length()) {
            throw gpf.Error.HtmlHandlerMultiplicityError({
                member: member
            });
        }
        attribute = handlerAttributeArray.get(0);
        if (!(attribute instanceof _HtmEvent)) {
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
            allAttributes = new gpf.attributes.Map(instance).filter(_HtmBase),
            handlerAttributes = allAttributes.filter(_HtmHandler),
            defaultHandler,
            eventAttributes;
        if (0 === handlerAttributes.count()) {
            throw gpf.Error.HtmlHandlerMissing();
        }
        defaultHandler = handlerAttributes.each(_findDefaultHandler);
        if (undefined === defaultHandler) {
            throw gpf.Error.HtmlHandlerNoDefault();
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
        eventAttributes = allAttributes.filter(_HtmEvent);
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

    _gpfExtend(gpf.html, {

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
         * Add/Remove the provided class name(s) to the DOM object
         *
         * @param {Object} domObject
         * @param {String|String[]} toAdd
         * @param {String|String[]} toRemove
         * @return {Object}
         * @chainable
         */
        alterClass: function (domObject, toAdd, toRemove) {
            var
                classNames,
                lengthBefore,
                len,
                idx;
            if (domObject.className) {
                classNames = domObject.className.split(" ");
            } else {
                classNames = [];
            }
            lengthBefore = classNames.length;
            // Remove first (faster)
            if (undefined !== toRemove) {
                if ("string" === typeof toRemove) {
                    toRemove = [toRemove];
                }
                gpf.ASSERT(toRemove instanceof Array, "Expected array");
                len = toRemove.length;
                for (idx = 0; idx < len; ++idx) {
                    gpf.clear(classNames, toRemove[idx]);
                }
            }
            // Then add
            if (undefined !== toAdd) {
                if ("string" === typeof toAdd) {
                    toAdd = [toAdd];
                }
                gpf.ASSERT(toAdd instanceof Array, "Expected array");
                len = toAdd.length;
                for (idx = 0; idx < len; ++idx) {
                    gpf.set(classNames, toAdd[idx]);
                }
            }
            // Avoid resource consuming refresh if nothing changed
            if (lengthBefore !== classNames.length) {
                domObject.className = classNames.join(" ");
            }
            return domObject;
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
            return gpf.html.alterClass(domObject, toAdd, undefined);
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
            return gpf.html.alterClass(domObject, undefined, toRemove);
        }

    });

    //endregion

    //region Responsive page framework

    var
        /**
         * Responsive framework broadcaster
         *
         * @type {gpf.events.Broadcaster}
         * @private
         */
        _broadcaster = null,

        /**
         * Handle of a dynamic CSS section used for some responsive helpers
         *
         * @type {Object}
         * @private
         */
        _dynamicCss = null,

        /**
         * gpf-top
         *
         * @type {boolean}
         * @private
         */
        _monitorTop = false,

        /**
         * Current page width
         *
         * @type {Number}
         * @private
         */
        _width,

        /**
         * Current page height
         *
         * @type {Number}
         * @private
         */
        _height,

        /**
         * Current page scroll Y
         *
         * @type {Number}
         * @private
         */
        _scrollY,

        /**
         * Current page orientation
         *
         * @type {String}
         * @private
         */
        _orientation = "";

    function _updateDynamicCss() {
        var content = [];
        if (_monitorTop) {
            content.push(".gpf-top { top: ", _scrollY, "px; }\n");
        }
        _dynamicCss.innerHTML = content.join("");
    }

    /**
     * HTML Event "resize" listener
     *
     * @private
     */
    function _onResize() {
        _width = window.innerWidth;
        _height = window.innerHeight;
        var
            orientation,
            orientationChanged = false,
            toRemove = [],
            toAdd = [];
        if (_width > _height) {
            orientation = "gpf-landscape";
        } else {
            orientation = "gpf-portrait";
        }
        if (_orientation !== orientation) {
            toRemove.push(_orientation);
            _orientation = orientation;
            toAdd.push(orientation);
            orientationChanged = true;
        }
        gpf.html.alterClass(document.body, toAdd, toRemove);
        _broadcaster.broadcastEvent("resize", {
            width: _width,
            height: _height
        });
        if (orientationChanged) {
            _broadcaster.broadcastEvent("rotate", {
                orientation: orientation
            });
        }
    }

    /**
     * HTML Event "scroll" listener
     *
     * @private
     */
    function _onScroll() {
        _scrollY = window.scrollY;
        if (_monitorTop && _dynamicCss) {
            _updateDynamicCss();
        }
        _broadcaster.broadcastEvent("scroll", {
            top: _scrollY
        });
    }

    /**
     * Generates the initial calls for responsive framework
     *
     * @private
     */
    function _init() {
        _onResize();
        _onScroll();
    }

    /**
     * Install (if not done) responsive framework handlers:
     * - Listen to the resize handlers and insert body css classNames according
     *   to the current configuration:
     *
     * @param {Object} options
     * <ul>
     *     <li>{Boolean} [monitorTop=undefined] monitorTop If true, a CSS class
     *     gpf-top is defined and maintained to the vertical offset of top
     *     </li>
     * </ul>
     * @return {gpf.events.Broadcaster}
     */
    gpf.html.responsive = function (options) {
        var
            needDynamicCss,
            headTag;
        if (options && undefined !== options.monitorTop) {
            _monitorTop = options.monitorTop;
        }
        needDynamicCss = _monitorTop;
        if (needDynamicCss) {
            if (!_dynamicCss) {
                headTag = document.getElementsByTagName("head")[0]
                          || document.documentElement;
                _dynamicCss = document.createElement("style");
                _dynamicCss.setAttribute("type", "text/css");
                _dynamicCss = headTag.appendChild(_dynamicCss);
            }
        } else if (_dynamicCss) {
            // Remove
            _dynamicCss.parentNode.removeChild(_dynamicCss);
            _dynamicCss = null;
        }
        if (null === _broadcaster) {
            _broadcaster = new gpf.events.Broadcaster([

                /**
                 * @event resize
                 * @eventParam {Number} width
                 * @eventParam {Number} height
                 */
                "resize",

                /**
                 * @event rotate
                 * @eventParam {String} orientation
                 */
                "rotate",

                /**
                 * @event scroll
                 * @eventParam {Number} top
                 */
                "scroll"
            ]);
            // Use the document to check if the framework is already installed
            window.addEventListener("resize", _onResize);
            window.addEventListener("scroll", _onScroll);
            // First execution (deferred to let caller register on them)
            gpf.defer(_init, 0);
        }
        return _broadcaster;
    };

    //endregion

    //region Handles gpf-loaded tag

    var
        _gpfIncludes = [];

    function _searchGpfLoaded () {
        /**
         * Look for a script tag with the gpf-loaded attribute
         */
        var scripts = document.getElementsByTagName("script"),
            len = scripts.length,
            idx,
            script,
            gpfLoaded;
        for (idx = 0; idx < len; ++idx) {
            script = scripts[idx];
            gpfLoaded = script.getAttribute("gpf-loaded");
            if (gpfLoaded) {
                script.removeAttribute("gpf-loaded");
                gpfLoaded = gpfLoaded.split(",");
                len = gpfLoaded.length;
                for (idx = 0; idx < len; ++idx) {
                    _gpfIncludes.push(gpfLoaded[idx]);
                }
            }
        }
        // Load the scripts sequentially
        if (_gpfIncludes.length) {
            _loadGpfIncludes();
        }
    }

    function _loadGpfIncludeFailed(event) {
        console.error("gpf-loaded: failed to include '" + event.get("url")
            + "'");
    }

    function _loadGpfIncludes() {
        if (!_gpfIncludes.length) {
            return;
        }
        var src = _gpfIncludes.shift();
        gpf.http.include(src, {
            load: _loadGpfIncludes,
            error:_loadGpfIncludeFailed
        });
    }

    if (_GPF_HOST_BROWSER === gpf.host() || _GPF_HOST_PHANTOMJS === gpf.host()) {
        _searchGpfLoaded();
    }

    //endregion

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/