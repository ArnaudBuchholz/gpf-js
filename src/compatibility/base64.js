/**
 * @file base64 polyfill
 * @since 0.2.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAtob*/ // atob polyfill
/*global _gpfBtoa*/ // btoa polyfill
/*global _gpfCompatibilityInstallGlobal*/ // Install compatible global if missing
/*#endif*/

_gpfCompatibilityInstallGlobal("atob", _gpfAtob);
_gpfCompatibilityInstallGlobal("btoa", _gpfBtoa);

/*#ifndef(UMD)*/

// Generates an empty function to reflect the null complexity of this module
(function _gpfCompatibilityBase64 () {}());

/*#endif*/
