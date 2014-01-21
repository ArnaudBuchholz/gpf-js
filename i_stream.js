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
     * Internal helper to implement the same write behavior in all streams
     */
    gpfI.ITextStream._write = function (stream, writeArguments) {
        var argIdx, arg;
        for (argIdx = 0; argIdx < writeArguments.length; ++argIdx) {
            arg = arguments[argIdx];
            if (null !== arg && 'string' !== typeof arg) {
                arg = arg.toString();
            }
            stream._write(arg);
        }
        if (0 === argIdx) { // No parameter at all
            stream._write(null);
        }
    };

}()); /* End of privacy scope */
