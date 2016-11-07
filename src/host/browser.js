/**
 * @file Browser host adapter
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/
/*global _gpfExit:true*/ // Exit function
/*global _gpfHost*/ // Host type
/*global _gpfInBrowser:true*/ // The current host is a browser like
/*global _gpfWebDocument:true*/ // Browser document object
/*global _gpfWebHead:true*/ // Browser head tag
/*global _gpfWebWindow:true*/ // Browser window object
/*#endif*/

/*jshint browser: true*/
/*eslint-env browser*/

/* istanbul ignore next */ // Tested with NodeJS
if (_GPF_HOST.BROWSER === _gpfHost) {

    _gpfInBrowser = true;
    _gpfExit = function (code) {
        window.location = "https://arnaudbuchholz.github.io/gpf/exit.html?" + (code || 0);
    };

    _gpfWebWindow = window;
    _gpfWebDocument = document;
    _gpfWebHead = _gpfWebDocument.getElementsByTagName("head")[0] || _gpfWebDocument.documentElement;

}
