/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    /**
     * Error object, contains error information
     *
     * @class gpf.Error
     */
    gpf.define("gpf.Error", {

        _message: "",
        _name: "",

        init: function (message, name, extended) {
            this._message = message;
            if (name) {
                this._name = name;
            } else {
                this._name = "Error";
            }
            if (extended) {
                gpf.extend(this, extended);
            }
        },

        /**
         * Error message
         *
         * @return {String}
         */
        message: function () {
            return this._message;
        },

        /**
         * Error name
         *
         * @return {String}
         */
        name: function () {
            return this._name;
        }

    });

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/