/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST_NODEJS*/ // gpf.HOST_NODEJS
/*global _gpfHost*/ // Host type
/*global _gpfExit:true*/ // Exit function
/*global _gpfInNode:true*/ // The current host is a nodeJS like
/*#endif*/

/*jshint node: true*/
/*eslint-env node*/

if (_GPF_HOST_NODEJS === _gpfHost) {

    _gpfInNode = true;
    _gpfExit = process.exit;

}
