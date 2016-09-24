/**
 * @file PhantomJS host adapter
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST_PHANTOMJS*/ // gpf.HOST_PHANTOMJS
/*global _gpfExit:true*/ // Exit function
/*global _gpfHost*/ // Host type
/*global _gpfInBrowser:true*/ // The current host is a browser like
/*global _gpfInNode:true*/ // The current host is a nodeJS like
/*global _gpfWebDocument:true*/ // Browser document object
/*global _gpfWebHead:true*/ // Browser head tag
/*global _gpfWebWindow:true*/ // Browser window object
/*#endif*/

/*jshint phantom: true*/
/*jshint browser: true*/
/*eslint-env phantomjs, browser*/

/* istanbul ignore next */ // Tested with NodeJS
if (_GPF_HOST_PHANTOMJS === _gpfHost) {

    _gpfInNode = true;
    _gpfInBrowser = true;
    _gpfExit = function (code) {
        phantom.exit(code);
    };

    _gpfWebWindow = window;
    _gpfWebDocument = document;
    _gpfWebHead = _gpfWebDocument.getElementsByTagName("head")[0] || _gpfWebDocument.documentElement;

}
