(function (context) { /* Begin of privacy scope */
    "use strict";

    /*global global*/ // NodeJS global
    if ("object" === typeof global) {
        context = global;
    }

    var _sources = [
    //  "boot",                 // Loader
        "compatibility",        // JavaScript compatibility helpers
        "constants",            // Constants
        "events",               // Event management         gpf.events.Event
        "include",              // WEB include               gpf.web.include
        "base",                 // General helpers
        "like",                 // Comparison helper                gpf.like
        "error",                // Error base class                gpf.Error
        "dispatch",             //                gpf.mixins.EventDispatcher
        "mimetype",             // Mime types handling   gpf.web.getMimeType
        "timeout",              //                                setTimeout
        "bin",                  // Binary tools                      gpf.bin
        "json",                 // JSON compatibility layer             JSON
        "path",                 // Path helper                      gpf.path
        "path_matcher",         // Path matcher                     gpf.path
        "javascript",           // JavaScript language tools          gpf.js
        "csv",                  // CSV helper                        gpf.csv
        "define",               // Class management               gpf.define
        "attributes",           // Attributes                 gpf.attributes
                                // (=> i_array)
        "a_attributes",         // AttributeClassOnly attributes
        "a_class",              // Class attributes
        "interfaces",           // Interfaces                 gpf.interfaces
        "i_enumerator",         // IEnumerator
        "i_array",              // IArray
        "i_stream",             // IStream
        "i_filestorage",        // IFileStorage
        "fs",                   // File system (FS)                   gpf.fs

        /* new JSHint settings */

        "fs_node",              // FS implementation for nodeJS       gpf.fs

        "",                     // --- temporary end marker ---

        "fs_ms",                // FS implementation for WScript      gpf.fs

        "",                     // --- temporary end marker ---

        "stream",               // IStream helpers                gpf.stream
        "stream_out",           // gpf.stream.Out
        "stream_node",          // IStream helpers for nodeJS     gpf.stream

        "string",               // String functions
        "array",                // Array functions
        "date",                 // Date functions

        "promise",              // Promise                       gpf.Promise
        "i_wrapper",            // Interface wrapper  gpf.interfaces.Wrapper

        "parser",               // Parser helper                  gpf.Parser
        "tokenizer",            // Javascript parser                  gpf.js

        "encoding",             // Encoding                     gpf.encoding

        "i_xml",                // IXmlSerializable & IXmlContentHandler
        "a_xml",                // Xml attributes
        "xml",                  // Xml helpers                       gpf.xml
        "xserial",              // Xml serialization
        "xnode",                // Xml 'DOM' structure               gpf.xml
        "xpath",                // Xml 'XPATH' parser/evaluator      gpf.xml

        "params",               // Parameters parsing             gpf.Params

        "serial",               // Object serialization           gpf.serial

        // The following ones must be at the end
        "html",                 // HTML specific functions          gpf.html
        "websvr"                // Simple JSP web server (nodeJS specific)
    ];

    if (!context.gpf) {
        context.gpf = {};
    }
    gpf.sources = function () {
        return [].concat(_sources);
    };

}(this)); /* End of privacy scope */
