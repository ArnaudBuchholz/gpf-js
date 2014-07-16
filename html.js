/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    var
        gpfI = gpf.interfaces;

    gpf.html = {};

    gpf.define("gpf.html.Md2HtmlStream", {

        "[Class]": [gpf.$InterfaceImplement(gpfI.IReadableStream)],

        public: {

            /**
             * @param {gpf.interfaces.IReadableStream} iStream
             */
            constructor: function (iStream) {
                this._iStream = gpfI.query(iStream, gpfI.IReadableStream, true);
            },

            //region gpf.interfaces.IReadableStream

            /**
             * @implements gpf.interfaces.IReadableStream:read
             */
            read: function (size, eventsHandler) {
                gpf.interfaces.ignoreParameter(size);
                gpf.interfaces.ignoreParameter(eventsHandler);
            }

            //endregion
        },

        //region Implementation

        private: {

            _iStream: null

        }

        //endregion
    });

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/