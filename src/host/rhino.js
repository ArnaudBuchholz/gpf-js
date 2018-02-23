/**
 * @file Rhino host adapter
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfBootImplByHost*/ // Boot host specific implementation per host
/*global _gpfJavaHostImpl*/ // Common implementation for Java hosts
/*#endif*/

/**
 * @namespace gpf.rhino
 * @description Root namespace for Rhino specifics
 * @since 0.2.1
 * @deprecated since version 0.2.4, use {@link gpf.java} instead
 */
gpf.rhino = gpf.java;

_gpfBootImplByHost[_GPF_HOST.RHINO] = _gpfJavaHostImpl;
