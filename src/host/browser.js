/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST_BROWSER*/ // gpf.HOST_BROWSER
/*global _gpfHost*/ // Host type
/*global _gpfExit:true*/ // Exit function
/*global _gpfInBrowser:true*/ // The current host is a browser like
/*#endif*/

/*jshint browser: true*/
/*eslint-env browser*/

if (_GPF_HOST_BROWSER === _gpfHost) {

    _gpfInBrowser = true;
    _gpfExit = function (code) {
        window.location = "https://arnaudbuchholz.github.io/gpf/exit.html?" + (code || 0);
    };

}
