/**
 * @file NodeJS host adapter
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/
/*global _gpfExit:true*/ // Exit function
/*global _gpfHost*/ // Host type
/*global _gpfInNode:true*/ // The current host is a nodeJS like
/*#endif*/

/*jshint node: true*/
/*eslint-env node*/

/* istanbul ignore else */ // Tested with NodeJS
if (_GPF_HOST.NODEJS === _gpfHost) {

    /* istanbul ignore next */ // Not testable
    _gpfExit = function (code) {
        process.exit(code);
    };

}
