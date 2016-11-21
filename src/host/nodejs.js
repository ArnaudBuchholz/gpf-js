/**
 * @file NodeJS host adapter
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfExit:true*/ // Exit function
/*global _gpfHost*/ // Host type
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
