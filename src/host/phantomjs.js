/**
 * @file PhantomJS host adapter
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

/*jshint phantom: true*/
/*jshint browser: true*/
/*eslint-env phantomjs, browser*/

/* istanbul ignore next */ // Tested with NodeJS
if (_GPF_HOST.PHANTOMJS === _gpfHost) {

    _gpfExit = function (code) {
        phantom.exit(code);
    };

    _gpfWebWindow = window;
    _gpfWebDocument = document;

}
