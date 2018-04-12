/**
 * @file Browser host adapter
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfExit:true*/ // Exit function
/*global _gpfHost*/ // Host type
/*global _gpfWebDocument:true*/ // Browser document object
/*global _gpfWebWindow:true*/ // Browser window object
/*#endif*/

/*jshint browser: true*/
/*eslint-env browser*/

if (_GPF_HOST.BROWSER === _gpfHost) {

    /* istanbul ignore next */ // exit.1
    _gpfExit = function (code) {
        window.location = "https://arnaudbuchholz.github.io/gpf/exit.html?" + code;
    };

    _gpfWebWindow = window;
    _gpfWebDocument = document;

}
