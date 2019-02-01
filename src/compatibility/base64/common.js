/**
 * @file Common to atob & btoa polyfills
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfALPHA*/ // Letters (uppercase)
/*global _gpfAlpha*/ // Letters (lowercase)
/*global _gpfDigit*/ // Digits
/*exported _gpfBase64*/
/*#endif*/

var _gpfBase64 = _gpfALPHA + _gpfAlpha + _gpfDigit + "+/=";
