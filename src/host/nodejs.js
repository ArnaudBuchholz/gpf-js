/**
 * @file NodeJS host adapter
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfExit:true*/ // Exit function
/*global _gpfHost*/ // Host type
/*global _gpfNodeFs:true*/ // Node require("fs")
/*exported _gpfNodeHttp*/ // Node require("http")
/*exported _gpfNodeUrl*/ // Node require("url")
/*#endif*/

/*jshint node: true*/
/*eslint-env node*/

var
    /**
     * require("http")
     *
     * @type {Object}
     */
    _gpfNodeHttp,

    /**
     * require("url")
     *
     * @type {Object}
     */
    _gpfNodeUrl;

/* istanbul ignore else */ // Tested with NodeJS
if (_GPF_HOST.NODEJS === _gpfHost) {

    _gpfNodeFs = require("fs");
    _gpfNodeHttp = require("http");
    _gpfNodeUrl = require("url");

    /* istanbul ignore next */ // Not testable
    _gpfExit = function (code) {
        process.exit(code);
    };

    /**
     * @namespace gpf.node
     * @description Root namespace for NodeJS specifics
     * @since 0.1.5
     */
    gpf.node = {};

}
