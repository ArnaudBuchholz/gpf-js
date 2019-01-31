/**
 * @file base64 polyfill
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfCompatibilityInstallGlobal*/ // Install compatible global if missing
/*global _gpfAtob*/ // atob polyfill
/*global _gpfBtoa*/ // btoa polyfill
/*#endif*/

_gpfCompatibilityInstallGlobal("atob", _gpfAtob);
_gpfCompatibilityInstallGlobal("btoa", _gpfBtoa);
