/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST_PHANTOMJS*/ // gpf.HOST_PHANTOMJS
/*global _gpfHost*/ // Host type
/*global _gpfExit:true*/ // Exit function
/*global _gpfInNode:true*/ // The current host is a nodeJS like
/*global _gpfInBrowser:true*/ // The current host is a browser like
/*#endif*/

/*jshint phantom: true*/
/*jshint browser: true*/
/*eslint-env phantomjs, browser*/

if (_GPF_HOST_PHANTOMJS === _gpfHost) {

    _gpfInNode = true;
    _gpfInBrowser = true;
    _gpfExit = phantom.exit;

}
