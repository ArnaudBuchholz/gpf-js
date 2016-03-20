/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST_NODEJS*/ // gpf.HOST_NODEJS
/*global _gpfHost*/ // Host type
/*global _gpfExit*/ // Exit function
/*global _gpfMainContext*/ // Main context object
/*#endif*/

if (_GPF_HOST_NODEJS === _gpfHost) {

    _gpfMainContext = global;
    _gpfInNode = true;
    _gpfExit = process.exit;

}
