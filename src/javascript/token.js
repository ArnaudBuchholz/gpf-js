/**
 * @file JavaScript token definition
 */
/*#ifndef(UMD)*/
"use strict";
/*#endif*/

/**
 * Token types
 */
var _GPF_JAVASCRIPT_TOKEN = {
	KEYWORD: "keyword",
	IDENTIFIER: "identifier",
	STRING: "string",
	NUMBER: "number",
	SYMBOL: "symbol",
	COMMENT: "comment",
	SPACE: "space"
};

/**
 * Token type enumeration
 *
 * @enum {String}
 * @readonly
 */
gpf.javascript.token = {
	/**
	 * Any javascript predefined keyword
	 */
	keyword: _GPF_JAVASCRIPT_TOKEN.KEYWORD,

	/**
	 * Any javascript identifier that is not a keyword
	 */
	identifier: _GPF_JAVASCRIPT_TOKEN.IDENTIFIER,

	/**
	 * A string (single or double quote)
	 */
	string: _GPF_JAVASCRIPT_TOKEN.STRING,

	/**
	 * A number
	 */
	number: _GPF_JAVASCRIPT_TOKEN.NUMBER
};

/**
 * JavaScript token
 *
 * @typedef gpf.typedef.Token
 * @property {gpf.javascript.token} type Token type
 * @see gpf.javascript.Tokenizer
 */
