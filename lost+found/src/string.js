/**
 * @file String helpers
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfStringCapitalize*/ // Capitalize the string
/*global _gpfStringEscapeFor*/ // Make the string content compatible with lang
/*global _gpfStringReplaceEx*/ // String replacement using dictionary map
/*#endif*/

//region String Array helpers

Object.assign(gpf, {

    /** sameas _gpfStringCapitalize */
    capitalize: _gpfStringCapitalize,

    /** sameas _gpfStringReplaceEx */
    replaceEx: _gpfStringReplaceEx,

    /** sameas _gpfStringEscapeFor */
    escapeFor: _gpfStringEscapeFor

});
