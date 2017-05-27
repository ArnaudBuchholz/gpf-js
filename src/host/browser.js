/**
 * @file Browser host adapter
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfBootImplByHost*/ // Boot host specific implementation per host
/*global _gpfExit:true*/ // Exit function
/*global _gpfWebDocument:true*/ // Browser document object
/*global _gpfWebWindow:true*/ // Browser window object
/*#endif*/

/*jshint browser: true*/
/*eslint-env browser*/

_gpfBootImplByHost[_GPF_HOST.BROWSER] = function () {

    /* istanbul ignore next */ // exit.1
    _gpfExit = function (code) {
        window.location = "https://arnaudbuchholz.github.io/gpf/exit.html?" + (code || 0);
    };

    _gpfWebWindow = window;
    _gpfWebDocument = document;

};
