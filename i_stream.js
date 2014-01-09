(function () { /* Begin of privacy scope */
    /*global document,window,console*/
    /*global process,require,exports,global*/
    /*global gpf*/
    /*jslint continue: true, nomen: true, plusplus: true*/
    "use strict";

    gpf.interfaces.ITextStream = gpf.interfaces.Interface.extend({

        /**
         * Read characters from the text stream
         *
         * @param {number} [count=undefined] count Number of chars to read from,
         * read as much as possible if not specified
         * @returns {string} null if the end of the stream is reached
         */
        read: function(count) {
            gpf.interfaces.ignoreParameter(count);
            return "";
        },

        /**
         * Write characters to the text stream
         *
         * @param {string} buffer
         */
        write: function(buffer) {
            gpf.interfaces.ignoreParameter(buffer);
        }

    });

}()); /* End of privacy scope */
