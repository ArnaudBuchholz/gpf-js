/**
 * @file Class visibility definition
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfExtend*/ // gpf.extend
/*global _GpfClassDefMember*/ // GPF class member definition
/*exported _GPF_VISIBILITY*/ // Member visibility enum
/*exported _gpfVisibilityFromKeyword*/ // Convert visibility keyword into enum
/*#endif*/

var _gpfVisibilityKeywords      = "public|protected|private|static".split("|"),

    /**
     * Enumeration of visibility values
     *
     * @enum {Number}
     */
    _GPF_VISIBILITY = {
        /** Not set or keyword not recognized */
        UNKNOWN   : -1,
        /** Public */
        PUBLIC    : 0,
        /** Protected */
        PROTECTED : 1,
        /** Private */
        PRIVATE   : 2,
        /** Static */
        STATIC    : 3
    };

/**
 * Convert visibility keyword into the corresponding enum value
 *
 * @param {String} keyword Keyword to convert
 * @returns {_GPF_VISIBILITY}
 */
function _gpfVisibilityFromKeyword (keyword) {
    return _gpfVisibilityKeywords.indexOf(keyword);
}

//region Extension of _GpfClassDefMember

_gpfExtend(_GpfClassDefMember.prototype, /** @lends _GpfClassDefMember.prototype */ {

    /**
     * Member visibility
     *
     * @type {_GPF_VISIBILITY}
     */
    _visibility: _GPF_VISIBILITY.PUBLIC,

    _setVisibility: function (visibility) {
        this._visibility = visibility;
    },

    /** @return {_GPF_VISIBILITY} Member visibility */
    getVisibility: function () {
        return this._visibility;
    }

});

//endregion Extension of _GpfClassDefMember

/*#ifndef(UMD)*/

gpf.internals._GPF_VISIBILITY = _GPF_VISIBILITY;
gpf.internals._gpfVisibilityFromKeyword = _gpfVisibilityFromKeyword;

/*#endif*/
