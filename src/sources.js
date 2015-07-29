(function () { /* Begin of privacy scope */
    "use strict";

    var
        _sources = [
            "compatibility",        // JavaScript compatibility helpers

            /* new JSHint settings */

            "constants",            // Constants
            "events",               // Event management         gpf.events.Event
            "include",              // WEB include               gpf.web.include

                                    // --- Minimum required for boot_web.js ---

            "base",                 // Basic functions
            "like",                 // Comparison helper                gpf.like
            "callback",             // Callback object              gpf.Callback
            "dispatch",             //            gpf.events.EventDispatcherImpl
            "mimetype",             // Mime types handling   gpf.web.getMimeType
            "async",                // Asynchronous handling           gpf.defer
            "bin",                  // Binary tools                      gpf.bin
            "json",                 // JSON compatibility layer         gpf.json
                                    // (=> a_class)
            "path",                 // Path helper                      gpf.path
            "path_matcher",         // Path matcher                     gpf.path
            "error",                // Error base class                gpf.Error
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
            "fs_node",              // FS implementation for nodeJS       gpf.fs
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

            // The following ones must be at the end
            "html",                 // HTML specific functions          gpf.html
            "websvr"                // Simple JSP web server (nodeJS specific)
        ];

    gpf.sources = function () {
        return _sources.join(",");
    };

}()); /* End of privacy scope */
