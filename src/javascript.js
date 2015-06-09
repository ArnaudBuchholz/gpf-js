/*#ifndef(UMD)*/
"use strict";
/*global _gpfJsKeywords*/ //  List of JavaScript keywords
/*#endif*/

gpf.js = {

    /**
     * The list of JavaScript keywords
     *
     * @return {String[]}
     */
    keywords: function () {
        return [].concat(_gpfJsKeywords);
    }

};