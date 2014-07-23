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
                    closeParagraph = false;
                if ("\n" === char) {
                    closeParagraph = true;
                } else if ("#" === char) {
                    closeParagraph = true;
                    this._hLevel = 1;
                    this._setParserState(this._parseTitle);
                } else if ("*" === char) {
                    closeParagraph = true;
                    this._setParserState(this._parseList);
                } else if (" " !== char && "\t" !== char) {
                    this._openTag("p");
                    this._parseContent(char);
                }
                if (closeParagraph) {
                    this._closeParagraph();
                }
            }

        },

        private: {

            _openedTags: [],

            _closeParagraph: function () {
                var tag;
                while (this._openedTags.length) {
                    tag = this._openedTags.pop();
                    this._output("</" + tag + ">");
                    if ("p" === tag) {
                        break;
                    }
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
                    this._setParserState(this._parseText);
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
                this._setParserState(this._parseText);
            },

            _parseContent: function (char) {
                this._parseText(char);
            },

            _parseText: function (char) {
                // Ignore any formatting until \n
                if ("\n" === char) {
                    this._setParserState(this._initialParserState);
                } else {
                    this._output(char);
                }
            }
        }

    });

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/