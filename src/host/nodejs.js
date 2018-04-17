/**
 * @file NodeJS host adapter
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfDosPath:true*/ // DOS-like path
/*global _gpfExit:true*/ // Exit function
/*global _gpfHost*/ // Host type
/*global _gpfNodeFs:true*/ // Node/PhantomJS require("fs")
/*exported _gpfNodeHttp*/ // Node require("http")
/*exported _gpfNodeHttps*/ // Node require("https")
/*exported _gpfNodePath*/ // Node require("path")
/*exported _gpfNodeUrl*/ // Node require("url")
/*#endif*/

/*jshint node: true*/
/*eslint-env node*/

var
    /**
     * require("http")
     *
     * @type {Object}
     * @since 0.2.1
     */
    _gpfNodeHttp,

    /**
     * require("https")
     *
     * @type {Object}
     * @since 0.2.5
     */
    _gpfNodeHttps,

    /**
     * require("path")
     *
     * @type {Object}
     * @since 0.1.5
     */
    _gpfNodePath,

    /**
     * require("url")
     *
     * @type {Object}
     * @since 0.2.1
     */
    _gpfNodeUrl;

/**
 * @namespace gpf.node
 * @description Root namespace for NodeJS specifics
 * @since 0.1.5
 */
gpf.node = {};

if (_GPF_HOST.NODEJS === _gpfHost) {

    _gpfNodePath = require("path");
    _gpfNodeFs = require("fs");
    _gpfNodeHttp = require("http");
    _gpfNodeHttps = require("https");
    _gpfNodeUrl = require("url");

    _gpfDosPath = _gpfNodePath.sep === "\\";

    /* istanbul ignore next */ // exit.1
    _gpfExit = function (code) {
        process.exit(code);
    };

}
