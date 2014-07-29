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
     *      | content
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
             * State init
             *
             * @param {String} char
             * @private
             */
            _initialParserState: function (char) {
                var
                    newState,
                    inParagraph = this._inParagraph;
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
                    inParagraph = false; // Wait for disambiguation
                } else if (" " !== char && "\t" !== char && "\n" !== char) {
                    if (!inParagraph) {
                        this._openTag("p");
                        this._inParagraph = true;
                    } else {
                        this._output(" ");
                        inParagraph = false; // Avoid closing below
                    }
                    newState = this._parseContent(char);
                    if (!newState) {
                        newState = this._parseContent;
                    }
                }
                if (inParagraph) {
                    this._closeTags();
                }
                return newState;
            }

        },

        private: {

            _inParagraph: false,
            _openedTags: [],

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
                // If we were in a paragraph, we are not anymore
                this._inParagraph = false;
            },

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

            _openTag: function (tag) {
                this._output("<" + tag + ">");
                this._openedTags.push(tag);
            },

            _hLevel: 1,

            /**
             * States title1, ... N
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

            _numericList: false,

            /**
             * list
             * @param {String} char
             * @private
             */
            _parseList: function (char) {
                var
                    inParagraph = this._inParagraph,
                    listTag;
                if (" " === char) {
                    // Start or append list
                    if (this._numericList) {
                        listTag = "ol";
                    } else {
                        listTag = "ul";
                    }
                    if (inParagraph) {
                        this._closeTags();
                        this._openTag(listTag);
                    } else {
                        this._openList(listTag);
                    }
                    this._openTag("li");
                } else if ("*" === char) {
                    if (inParagraph) {
                        this._output(" "); // new line inside a paragraph
                    }
                    this._openTag("strong");
                }
                return this._parseContent;
            },

            _handleEscape: function (char) {
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
             * content
             * @param {String} char
             * @private
             */
            _parseContent: function (char) {
                if (this._handleEscape(char)) {
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
                } else if ("\n" === char) {
                    return null;
                } else {
                    this._output(char);
                }
            },

            /**
             * italic
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
             * text
             * @param {String} char
             * @private
             */
            _parseText: function (char) {
                if (this._handleEscape(char)) {
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
             * link
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

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/