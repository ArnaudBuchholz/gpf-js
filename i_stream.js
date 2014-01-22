(function () { /* Begin of privacy scope */
    /*global document,window,console*/
    /*global process,require,exports,global*/
    /*global gpf*/
    /*jslint continue: true, nomen: true, plusplus: true*/
    "use strict";

    var
        gpfI = gpf.interfaces;

    gpfI.ITextStream = gpfI.Interface.extend({

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
         * Write characters to the text stream.
         * Use null to signal the end of the stream.
         *
         * @param [arguments] Convert all non-null arguments to string and write
         * them to the string
         *
         * TODO create an attribute to signal the use of arguments
         */
        write: function() {
        }

    });

    /**
     * Internal helper to implement the expected write behavior in all streams
     */
    gpfI.ITextStream._write = function () {
        var argIdx, arg;
        for (argIdx = 0; argIdx < arguments.length; ++argIdx) {
            arg = arguments[argIdx];
            if (null !== arg && 'string' !== typeof arg) {
                arg = arg.toString();
            }
            this.write_(arg);
        }
        if (0 === argIdx) { // No parameter at all
            this.write_(null);
        }
    };

}()); /* End of privacy scope */
