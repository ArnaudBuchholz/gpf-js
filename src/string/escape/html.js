/*#ifndef(UMD)*/
"use strict";
/*global _gpfStringEscapes*/ // String replacement using dictionary map
/*global _gpfExtend*/ // gpf.extend
/*#endif*/

_gpfStringEscapes.html = _gpfExtend(_gpfStringEscapes.xml, {
    "\u00E0": "&agrave;",
    "\u00E1": "&aacute;",
    "\u00E8": "&egrave;",
    "\u00E9": "&eacute;",
    "\u00EA": "&ecirc;"
});
