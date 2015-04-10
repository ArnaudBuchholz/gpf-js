(function () { /* Begin of privacy scope */
    "use strict";

    var
        _sources = [
            "compatibility",        // JavaScript compatibility helpers
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
            "path",                 // Path helper                      gpf.path
            "error",                // Error base class                gpf.Error
            "javascript",           // JavaScript language tools          gpf.js
            "csv",                  // CSV helper                        gpf.csv

            "define",               // Class management               gpf.define
            "attributes",           // Attributes                 gpf.attributes

            "",                     // --- temporary end marker ---

            "att_class",            // Class attributes
            "att_json",             // JSON serializer
            "interface",            // Interface                  gpf.interfaces
            "i_enumerable",         // IEnumerable
            "i_array",              // IArray
            "i_stream",             // IStream and helpers            gpf.stream
            "string",               // String functions
            "array",                // Array functions
            "date",                 // Date functions

            "promise",              // Promise                       gpf.Promise
            "i_wrapper",            // Interface wrapper  gpf.interfaces.Wrapper

            "parser",               // Parser helper                  gpf.Parser
            "tokenizer",            // Javascript parser                  gpf.js

            "encoding",             // Encoding                     gpf.encoding

            "xml",                  // Xml serializer & attributes       gpf.xml
            "xnode",                // Xml 'DOM' structure               gpf.xml
            "xpath",                // Xml 'XPATH' parser/evaluator      gpf.xml

            "params",               // Parameters parsing             gpf.Params
            "fs",                   // File system                        gpf.fs

            // The following ones must be at the end
            "html",                 // HTML specific functions          gpf.html
            "websvr"                // Simple JSP web server (nodeJS specific)
        ];

    gpf.sources = function () {
        return _sources.join(",");
    };

}()); /* End of privacy scope */
