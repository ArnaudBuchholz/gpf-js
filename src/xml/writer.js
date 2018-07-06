/**
 * @file XML Writer
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _GpfStreamBufferedRead*/ // gpf.stream.BufferedRead
/*exported _GpfXmlWriter*/ // gpf.xml.Writer
/*#endif*/

var
    /**
     * XML writer
     *
     * @constructor gpf.xml.Writer
     * @implements {gpf.interfaces.IReadableStream}
     * @implements {gpf.interfaces.IXmlContentHandler}
     * @extends gpf.stream.BufferedRead
     */
    _GpfXmlWriter = _gpfDefine({
        $class: "gpf.xml.Writer",
        $extend: _GpfStreamBufferedRead,

        // region gpf.interfaces.IXmlContentHandler

        /**
         * @gpf:sameas gpf.interfaces.IXmlContentHandler#characters
         */
        characters: function (buffer) {
            this._appendToReadBuffer(buffer);
            return Promise.resolve();
        }

        //endregion

    });
