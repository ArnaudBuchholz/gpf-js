/**
 * @file Browser File system implementation
 * @since 0.2.2
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfFsReadImplByHost*/ // gpf.fs.read per host
/*#endif*/

_gpfFsReadImplByHost[_GPF_HOST.BROWSER] = gpf.Error.notImplemented;
