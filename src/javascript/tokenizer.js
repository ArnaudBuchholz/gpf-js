/**
 * @file JavaScript tokenizer
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfStreamAbtsractOperator*/ // gpf.stream.AbstractOperator
/*global _gpfDefine*/ // Shortcut for gpf.define
/*exported _GpfJavascriptTokenizer*/ // gpf.javascript.Tokenizer
/*#endif*/

var
	_GpfJavascriptTokenizer = _gpfDefine({
		$class: "gpf.javascript.Tokenizer",
		$extend: _GpfStreamAbtsractOperator,

	});
