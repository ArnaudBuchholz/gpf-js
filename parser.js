(function () { /* Begin of privacy scope */
    "use strict";
    /*global document,window,console*/
    /*global process,require,exports,global*/
    /*global gpf*/
    /*jslint continue: true, nomen: true, plusplus: true*/

    /**
     * This parser base class maintain the current stream position
     * And also offers some basic features to improve parsing speed
     *
     * @class gpf.Parser
     */
    gpf.Parser = gpf.Class.extend({

        "[Class]": [gpf.$InterfaceImplement(gpfI.ITextStream)],

        _pos: 0,
        _line: 0,
        _column: 0,

        init: function () {
            this._pos = 0;
            this._line = 0;
            this._column = 0;
        },

        currentPos: function () {
            return {
                pos: this._pos,
                line: this._line,
                column: this._column
            };
        },

        //region gpf.interfaces.ITextStream

        /**
         * @implements gpf.interfaces.ITextStream.read
         */
        read: function(count) {
            gpf.interfaces.ignoreParameter(count);
            return "";
        },

        /**
         * @implements gpf.interfaces.ITextStream.write
         */
        write: function(buffer) {
            var idx, char;
            for (idx = 0; idx < buffer.length; ++idx) {
                char = buffer.charAt(idx);

                ++this._pos;
                if ("\n" === char) {
                    ++this._line;
                    this._column = 0;
                } else {
                    ++this._column;
                }
            }
        }

        //endregion

    });

}()); /* End of privacy scope */
