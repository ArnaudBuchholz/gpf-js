/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST_PHANTOMJS*/ // gpf.HOST_PHANTOMJS
/*global _gpfHost*/ // Host type
/*global _gpfExit*/ // Exit function
/*global _gpfMainContext*/ // Main context object
/*#endif*/

if (_GPF_HOST_PHANTOMJS === _gpfHost) {

    _gpfMainContext = window;
    _gpfInNode = true;
    _gpfInBrowser = true;
    _gpfExit = phantom.exit;

}
