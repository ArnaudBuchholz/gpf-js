/**
 * @file Nashorn host adapter
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfBootImplByHost*/ // Boot host specific implementation per host
/*global _gpfJavaHostImpl*/ // Common implementation for Java hosts
/*#endif*/

_gpfBootImplByHost[_GPF_HOST.NASHORN] = _gpfJavaHostImpl;
