/**
 * @file PhantomJS host adapter
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

/*jshint phantom: true*/
/*jshint browser: true*/
/*eslint-env phantomjs, browser*/

_gpfBootImplByHost[_GPF_HOST.PHANTOMJS] = function () {

    /* istanbul ignore next */ // Not testable
    _gpfExit = function (code) {
        phantom.exit(code);
    };

    _gpfWebWindow = window;
    _gpfWebDocument = document;

};
