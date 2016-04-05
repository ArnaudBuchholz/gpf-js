/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST_NODEJS*/ // gpf.HOST_NODEJS
/*global _gpfExit:true*/ // Exit function
/*global _gpfHost*/ // Host type
/*global _gpfInNode:true*/ // The current host is a nodeJS like
/*#endif*/

/*jshint node: true*/
/*eslint-env node*/

/* istanbul ignore else */ // Tested with NodeJS
if (_GPF_HOST_NODEJS === _gpfHost) {

    _gpfInNode = true;

    /* istanbul ignore next */ // Not testable
    _gpfExit = function (code) {
        process.exit(code);
    };

}
