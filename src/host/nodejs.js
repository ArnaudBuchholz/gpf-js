/**
 * @file NodeJS host adapter
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfBootImplByHost*/ // Boot host specific implementation per host
/*global _gpfExit:true*/ // Exit function
/*global _gpfNodeFs:true*/ // Node/PhantomJS require("fs")
/*exported _gpfNodeHttp*/ // Node require("http")
/*exported _gpfNodeHttps*/ // Node require("https")
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

_gpfBootImplByHost[_GPF_HOST.NODEJS] = function () {

    _gpfNodeFs = require("fs");
    _gpfNodeHttp = require("http");
    _gpfNodeHttps = require("https");
    _gpfNodeUrl = require("url");

    /* istanbul ignore next */ // exit.1
    _gpfExit = function (code) {
        process.exit(code);
    };

};
