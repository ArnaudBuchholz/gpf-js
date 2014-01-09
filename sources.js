(function () { /* Begin of privacy scope */
    "use strict";

    var
        _sources = [
            "base",                 // Basic functions
            "events",               // Event management               gpf.events
            "http",                 // HTTP specific functions          gpf.http
            "bin",                  // Binary tools                      gpf.bin
            "tokenizer",            // Javascript parser                  gpf.js
            "class",                // Class
            "attributes",           // Attributes                 gpf.attributes
            "error",                // Error base class
            "att_class",            // Class attributes
            "interface",            // Interface                  gpf.interfaces
//          "i_enumerable",         // IEnumerable
            "i_array",              // IArray
            "i_stream",             // ITextStream
            "string",               // String functions
            "date",                 // Date functions

            "xml"                   // Xml serializer & attributes       gpf.xml
        ];

    gpf.sources = function () {
        return _sources.join(",");
    };

}()); /* End of privacy scope */
