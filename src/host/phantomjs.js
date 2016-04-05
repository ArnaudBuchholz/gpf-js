/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST_PHANTOMJS*/ // gpf.HOST_PHANTOMJS
/*global _gpfExit:true*/ // Exit function
/*global _gpfHost*/ // Host type
/*global _gpfInBrowser:true*/ // The current host is a browser like
/*global _gpfInNode:true*/ // The current host is a nodeJS like
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

}
