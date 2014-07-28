/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    gpf.html = {};

    /**
     * Markdown to HTML converter using Parser interface
     * Inspired from http://en.wikipedia.org/wiki/Markdown
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
     *      : '*' text '*' '*' // bold
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
                } else if ("*" === char) {
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
            _textEnd: "",

            _closeTags: function () {
                var tag;
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

            /**
             * list
             * @param {String} char
             * @private
             */
            _parseList: function (char) {
                var
                    inParagraph = this._inParagraph;
                if (" " === char) {
                    if (inParagraph) {
                        this._closeTags();
                    }
                    // Start or append list
                    // Use column to know which list
                } else if ("*" === char) {
                    if (inParagraph) {
                        this._output(" "); // new line inside a paragraph
                    }
                    this._openTag("strong");
                    this._textEnd = "**";
                }
                return this._parseText;
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

            _parseContent: function (char) {
                if (this._handleEscape(char)) {
                    return;
                }
                if ("*" === char) {
                    this._openTag("em");
                    this._textEnd = "*";
                    return this._parseText;
                } else if ("`" === char) {
                    this._openTag("code");
                    this._textEnd = "`";
                    return this._parseText;
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

            _parseText: function (char) {
                var
                    tag;
                if (this._handleEscape(char)) {
                    return;
                }
                if (this._textEnd && char === this._textEnd.charAt(0)) {
                    // TODO not efficient, find a better way
                    this._textEnd = this._textEnd.substr(1);
                    if (!this._textEnd) {
                        tag = this._openedTags.pop();
                        this._output("</" + tag + ">");
                        return this._parseContent;
                    }
                } else if ("\n" === char) {
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