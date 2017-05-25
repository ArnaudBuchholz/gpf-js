/**
 * @file Triggers host specific boot
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfBootImplByHost*/ // Boot host specific implementation per host
/*global _gpfHost*/ // Host type
/*#endif*/

_gpfBootImplByHost[_gpfHost]();
