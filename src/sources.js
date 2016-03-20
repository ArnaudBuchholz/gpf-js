/*eslint-disable no-invalid-this, strict*/
(function (context) {/* Begin of privacy scope */
    "use strict";

    /* istanbul ignore else */ // Tested with NodeJS
    /*global global*/ // NodeJS global
    if ("object" === typeof global) {
        context = global;
    }

    var _sources = [
    //  "boot",                                             // Boot (host detection + non-UMD loader)
//      "assert",                                           // Assertion helpers
//      "boot/browser",                                     // Browser host adapter
//      "boot/nodejs",                                      // NodeJS host adapter
//      "boot/phantomjs",                                   // PhantomJS host adapter
//      "boot/rhino",                                       // Rhino host adapter
//      "boot/wscript",                                     // MS Script host adapter
//      "boot/core",                                        // Core variables & functions
        "compatibility/array",                              // Array methods polyfill
        "compatibility/date",                               // Date methods polyfill
        "compatibility/function",                           // Function methods polyfill
        "compatibility/object",                             // Object methods polyfill
        "compatibility/string",                             // String methods polyfill
        "compatibility/promise",                            // Promise polyfill              gpf.Promise
        "compatibility",                                    // Polyfills installer
        "constants",                                        // Constants
        "events",                                           // Event management         gpf.events.Event
        "include",                                          // WEB include               gpf.web.include
        "base",                                             // General helpers
        "function",                                         // Function builder
        "like",                                             // Comparison helper                gpf.like
        "error",                                            // Error base class                gpf.Error
        "dispatch",                                         //                gpf.mixins.EventDispatcher
        "mimetype",                                         // Mime types handling   gpf.web.getMimeType
        "timeout",                                          //                                setTimeout
        "bin",                                              // Binary tools                      gpf.bin
        "json",                                             // JSON compatibility layer             JSON
        "path",                                             // Path helper                      gpf.path
        "path/matcher",                                     // Path matcher                     gpf.path
        "javascript",                                       // JavaScript language tools          gpf.js
        "csv",                                              // CSV helper                        gpf.csv
        "define",                                           // Class management               gpf.define
        "attributes",                                       // Attributes                 gpf.attributes
        "attributes/attributes",                            // AttributeClassOnly attributes
        "attributes/class",                                 // Class attributes
        "interfaces",                                       // Interfaces                 gpf.interfaces
        "interfaces/enumerator",                            // IEnumerator
        "interfaces/array",                                 // IArray
        "interfaces/stream",                                // IStream
        "interfaces/filestorage",                           // IFileStorage
        "fs",                                               // File system (FS)                   gpf.fs

        "stream",                                           // Stream helpers                 gpf.stream
        "stream/pipe",                                      //                           gpf.stream.pipe
        "string",                                           // String functions
        "array",                                            // Array functions

        "",                                                 // --- temporary end marker ---

        "stream/node",
        "stream/cache",


// https://github.com/ArnaudBuchholz/gpf-js/milestones/Release%200.1.5:%20The%20next%20gen

        // https://github.com/ArnaudBuchholz/gpf-js/issues/67
        "parser",                                           // Parser helper                  gpf.Parser
        "pattern",                                          // Patterns                       gpf.Parser
        "tokenizer",                                        // Javascript parser                  gpf.js

        // https://github.com/ArnaudBuchholz/gpf-js/issues/66
        "fs/node",                                          // FS implementation for nodeJS       gpf.fs
        "fs/ms",                                            // FS implementation for WScript      gpf.fs

        // https://github.com/ArnaudBuchholz/gpf-js/issues/68
        "stream_out",                                       // gpf.stream.Out
        "stream_node",                                      // IStream helpers for nodeJS     gpf.stream
        "encoding",                                         // Encoding                     gpf.encoding

// https://github.com/ArnaudBuchholz/gpf-js/milestones/Release%200.2.1:%20XML
        "i_wrapper",                                        // Interface wrapper  gpf.interfaces.Wrapper

        "i_xml",                                            // IXmlSerializable & IXmlContentHandler
        "a_xml",                                            // Xml attributes
        "xml",                                              // Xml helpers                       gpf.xml
        "xserial",                                          // Xml serialization
        "xnode",                                            // Xml 'DOM' structure               gpf.xml
        "xpath",                                            // Xml 'XPATH' parser/evaluator      gpf.xml

        "params",                                           // Parameters parsing             gpf.Params

        "serial",                                           // Object serialization           gpf.serial

        // The following ones must be at the end
        "html",                                             // HTML specific functions          gpf.html
        "websvr"                                            // Simple JSP web server (nodeJS specific)
    ];

    /* istanbul ignore if */ // Tested with NodeJS: gpf is defined
    if (!context.gpf) {
        context.gpf = {};
    }
    gpf.sources = function () {
        return [].concat(_sources);
    };

}(this)); /* End of privacy scope */
