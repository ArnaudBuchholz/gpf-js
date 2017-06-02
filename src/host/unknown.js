/**
 * @file Unknown host adapter
 * @since 0.2.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfBootImplByHost*/ // Boot host specific implementation per host
/*global _gpfEmptyFunc*/ // An empty function
/*#endif*/

_gpfBootImplByHost[_GPF_HOST.UNKNOWN] = _gpfEmptyFunc;
