/**
 * @file PhantomJS host adapter
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfExit:true*/ // Exit function
/*global _gpfHost*/ // Host type
/*global _gpfWebDocument:true*/ // Browser document object
/*global _gpfWebHead:true*/ // Browser head tag
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
    _gpfWebHead = _gpfWebDocument.getElementsByTagName("head")[0] || _gpfWebDocument.documentElement;

}
