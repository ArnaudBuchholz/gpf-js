/**
 * @file Require JSON resource handling
 * @since 0.2.2
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfRequireProcessor*/ // Mapping of resource extension to processor function
/*#endif*/

_gpfRequireProcessor[".json"] = function (name, content) {
    return JSON.parse(content);
};
