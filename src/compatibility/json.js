/**
 * @file JSON polyfill
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfJsonParsePolyfill*/
/*global _gpfJsonStringifyPolyfill*/
/*global _gpfMainContext*/ // Main context object
/*#endif*/

// Used only for environments where JSON is not defined
if ("undefined" === typeof JSON) {

    // Creates the JSON global object
    _gpfMainContext.JSON = {
        parse: _gpfJsonParsePolyfill,
        stringify: _gpfJsonStringifyPolyfill
    };

}
