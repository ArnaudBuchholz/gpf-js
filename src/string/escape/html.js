/**
 * @file Definition of HTML escapes
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfExtend*/ // gpf.extend
/*global _gpfStringEscapes*/ // Dictionary of language to escapes
/*#endif*/

_gpfStringEscapes.html = _gpfExtend(_gpfStringEscapes.xml, {
    "\u00E0": "&agrave;",
    "\u00E1": "&aacute;",
    "\u00E8": "&egrave;",
    "\u00E9": "&eacute;",
    "\u00EA": "&ecirc;"
});
