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
                    this._setParserState(this._parseText);
                }
            },

            /**
             * list
             * @param {String} char
             * @private
             */
            _parseList: function (char) {
                var
                    inParagraph = this._inParagraph,
                    newState;
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
                    this._openTag("b");
                }
                return this._parseContent;
            },

            _parseContent: function (char) {
                if ("*" === char) {
                    this._openTag("em");
                } else if ("\n" === char) {
                    return null;
                } else {
                    this._output(char);
                }
            },

            _parseText: function (char) {
                // Ignore any formatting until \n
                if ("\n" === char) {
                    this._closeTags();
                    return null;
                } else {
                    this._output(char);
                }
            }
        }

    });

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/