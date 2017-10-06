/**
 * @file Require JSON resource handling
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfRequireProcessor*/
/*#endif*/

_gpfRequireProcessor[".json"] = function (name, content) {
    return JSON.parse(content);
};
