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

        //region Implementation

        private: {

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