/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    gpf.define("gpf.Error", {

        _message: 0,
        _name: 0,

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

        message: function () {
            return this._message;
        },

        name: function () {
            return this._name;
        }

    });

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/