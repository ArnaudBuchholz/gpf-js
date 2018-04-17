/**
 * @file PhantomJS host adapter
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfDosPath:true*/ // DOS-like path
/*global _gpfExit:true*/ // Exit function
/*global _gpfHost*/ // Host type
/*global _gpfNodeFs:true*/ // Node/PhantomJS require("fs")
/*global _gpfWebDocument:true*/ // Browser document object
/*global _gpfWebWindow:true*/ // Browser window object
/*#endif*/

/*jshint phantom: true*/
/*jshint browser: true*/
/*eslint-env phantomjs, browser*/

if (_GPF_HOST.PHANTOMJS === _gpfHost) {

    _gpfDosPath = require("fs").separator === "\\";

    /* istanbul ignore next */ // exit.1
    _gpfExit = function (code) {
        phantom.exit(code);
    };

    _gpfWebWindow = window;
    _gpfWebDocument = document;
    _gpfNodeFs = require("fs");

}
