/*
	TODO:
		- Improve symbol parsing:
			https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators
			+ - * / % ++ -- = += -= *= /= %=
			== === != !== > < >= <=
			&& || !
			<< >> >>> <<= >>= >>>= &= ^= |= | & ~
			[] () . ,

		- Improve string parsing:
			carriage return in the middle of one (tokenizer/basic/3)
*/
(function(){ /* Begin of privacy scope */

/*__rewriter_replace_with_values:on*/
var/*private*//*const*/
/*
	These are the types provided in the callback
*/
	_TOKEN_ERROR				= "error",
	_TOKEN_UNKNOWN			= "unknown",
/*
	break, case, catch, , continue, debugger, default
	delete, do, else, finally, for, function, if, in
	instanceof, new, return, switch, this, throw, try
	typeof, var, void, while, with
*/
	_TOKEN_KEYWORD			= "keyword",
/*
	[_a-zA-Z][_a-zA-Z0-9]*
*/
	_TOKEN_IDENTIFIER		= "identifier",
/*
	"[^"]" or '[^']'
*/
	_TOKEN_STRING 			= "string",
/*
	[0-9]+
*/
	_TOKEN_NUMBER 			= "number",
/*
	\[\]\{\}\(\)...
*/
	_TOKEN_SYMBOL 			= "symbol",
	_TOKEN_COMMENT			= "comment",
	_TOKEN_SPACE				= "space",

/*
	these are the internal parser state
*/
	_TOKEN_STATE_ERROR					= 99,
	_TOKEN_STATE_NONE						= 0,
	/* IDENTIFIER, separate first char from the next ones */
	_TOKEN_STATE_IDENTIFIER			= 2,
	/* STRING, detect begin, escape char */
	_TOKEN_STATE_STRING1_CHAR		= 3,
	_TOKEN_STATE_STRING1_ESCAPE	= 4,
	_TOKEN_STATE_STRING2_CHAR		= 5,
	_TOKEN_STATE_STRING2_ESCAPE	= 6,
	/* Intermediate before COMMENT or LCOMMENT */
	_TOKEN_STATE_SLASH					= 7,
	/* LCOMMENT, line comment */
	_TOKEN_STATE_LCOMMENT				= 8,
	/* COMMENT, other comment */
	_TOKEN_STATE_COMMENT				= 9,
	_TOKEN_SYMBOL_LIST					= "(){}[]<>|&?,.;:!=+-*/%^",
	_TOKEN_STATE_SYMBOL					= 10,
	_TOKEN_STATE_NUMBER					= 11,
	_TOKEN_SPACE_LIST						= " \t\r\n",
	_TOKEN_STATE_SPACE					= 12,

/*
	Error management:
	- May have a central error message management, hence the variable BASE
*/
	_TOKEN_ERROR_BASE_ 			= 0,
	_TOKEN_ERROR_ABORT 			= 0,
	_TOKEN_ERROR_UTOKEN			= 1,
	_TOKEN_ERROR_USTRING 		= 2,
	_TOKEN_ERROR_UCOMMENT 	= 3,

/*__rewriter_replace_with_values:off*/

	_TOKEN_ERRORS = [
		"Parsing aborted",
		"Unknown token",
		"Unterminated string",
		"Unterminated comment"
	],

	_tokenizerInit = function() {

		return {
			pos: 0,					// Position of token start
			line: 0,				//	Translated to line
			column: 0,			//	And column
			state: _TOKEN_STATE_NONE, // State
			chars: [],			// Current token
			nextPos: 0,			// Real position
			nextLine: 0,		//	Translated to line
			nextColumn: 0,	//	And column
			callback: null,	// Callback function
			that: null			// Transported this
		}

	},

	_tokenizerCallback = function( context, errorCode ) {

		var
			token,
			type,
			callbackContext = {
				pos: context.pos,
				line: context.line,
				column: context.column,
				code: 0,
				message: ""
			},
			result;
		if( undefined !== errorCode ) {

			// Error
			context.state = _TOKEN_STATE_ERROR;
			callbackContext.code = errorCode;
			callbackContext.message = _TOKEN_ERRORS[ errorCode - _TOKEN_ERROR_BASE_ ];
			type = _TOKEN_ERROR;
			token = callbackContext.message;

		} else {

			// Token
			var token = context.chars.join( "" );
			if( _TOKEN_STATE_IDENTIFIER === context.state ) {
				if( "break" === token
						|| "case" === token
						|| "catch" === token
						|| "continue" === token
						|| "debugger" === token
						|| "default" === token
						|| "delete" === token
						|| "do" === token
						|| "else" === token
						|| "finally" === token
						|| "for" === token
						|| "function" === token
						|| "if" === token
						|| "in" === token
						|| "instanceof" === token
						|| "new" === token
						|| "return" === token
						|| "switch" === token
						|| "this" === token
						|| "throw" === token
						|| "try" === token
						|| "typeof" === token
						|| "var" === token
						|| "void" === token
						|| "while" === token
						|| "with" === token )
					type = _TOKEN_KEYWORD;
				else
					type = _TOKEN_IDENTIFIER;
			} else if( _TOKEN_STATE_NONE === context.state )
				type = _TOKEN_UNKNOWN;
			else if( _TOKEN_STATE_SYMBOL === context.state )
				type = _TOKEN_SYMBOL;
			else if( _TOKEN_STATE_LCOMMENT === context.state
							|| _TOKEN_STATE_COMMENT === context.state )
				type = _TOKEN_COMMENT;
			else if( _TOKEN_STATE_STRING1_CHAR === context.state
							|| _TOKEN_STATE_STRING2_CHAR === context.state )
				type = _TOKEN_STRING;
			else if( _TOKEN_STATE_NUMBER === context.state )
				type = _TOKEN_NUMBER;
			else if( _TOKEN_STATE_SPACE === context.state )
				type = _TOKEN_SPACE;
		}
		result = context.callback.apply( context.that, [ type, token, callbackContext ] );
		// Whenever the callback returns true, we fire the ABORT error
		if( _TOKEN_ERROR !== type && result )
			result = _tokenizerCallback( context, _TOKEN_ERROR_ABORT );
		context.state = _TOKEN_STATE_NONE;
		context.chars = [];
		// New position
		context.pos = context.nextPos;
		context.line = context.nextLine;
		context.column = context.nextColumn;
		return result;
	},

	_tokenizeChar = function( context, newChar ) {
		var result = _analyzeChar( context, newChar );
		_computeNextPos( context, newChar );
		return result;
	},

	_computeNextPos = function( context, newChar ) {
		++context.nextPos;
		if( "\n" === newChar ) {
			++context.nextLine;
			context.nextColumn = 0;
		} else ++context.nextColumn;
	},

	_analyzeChar = function( context, newChar ) {

		if( _TOKEN_STATE_IDENTIFIER === context.state ) {
			if( ( "a" > newChar || newChar > "z" )
			  && ( "A" > newChar || newChar > "Z" )
			  && ( "0" > newChar || newChar > "9" )
			  && "_" != newChar ) {
				if( _tokenizerCallback( context ) )
					return true;
			} else {
				context.chars.push( newChar );
				return false;
			}

		} else if( _TOKEN_STATE_NUMBER === context.state ) {

			if( "0" > newChar || newChar > "9" ) {
				if( _tokenizerCallback( context ) )
					return true;
			} else {
				context.chars.push( newChar );
				return false;
			}

		} else if( _TOKEN_STATE_STRING1_CHAR === context.state
		         || _TOKEN_STATE_STRING2_CHAR === context.state ) {
			context.chars.push( newChar );
			if( "\\" === newChar ) ++context.state; // _ESCAPE
			else if( "\"" === newChar && _tokenizerCallback( context ) )
				return true;
			return false;

		} else if( _TOKEN_STATE_STRING1_ESCAPE === context.state
		         || _TOKEN_STATE_STRING2_ESCAPE === context.state ) {
			if( "\\" === newChar
			  || "r" === newChar
			  || "n" === newChar
			  || "t" === newChar
			  // TODO: handle one or the other considering the current type
			  || "\"" === newChar
			  || "'" === newChar ) {
				--context.state;
				context.chars.push( newChar );
				return false;
			} else {
				// Error?
			}

		} else if( _TOKEN_STATE_SLASH === context.state ) {
			if( "/" === newChar ) {
				context.state = _TOKEN_STATE_LCOMMENT;
				context.chars.push( newChar );
				return false;
			} else if( "*" === newChar ) {
				context.state = _TOKEN_STATE_COMMENT;
				context.chars.push( newChar );
				return false;
			} else {
				context.state = _TOKEN_STATE_SYMBOL;
				if( _tokenizerCallback( context ) )
					return true;
			}
		} else if( _TOKEN_STATE_LCOMMENT === context.state ) {
			context.chars.push( newChar );
			if( "\n" === newChar ) if( _tokenizerCallback( context ) )
				return true;
			return false;
		} else if( _TOKEN_STATE_COMMENT === context.state ) {
			context.chars.push( newChar );
			if( "/" === newChar && context.chars[ context.chars.length - 2 ] === "*" )
				if( _tokenizerCallback( context ) )
					return true;
			return false;

		} else if( _TOKEN_STATE_SPACE === context.state ) {

			if( -1 < _TOKEN_SPACE_LIST.indexOf( newChar ) ) {
				context.chars.push( newChar );
				return false;
			} else if( _tokenizerCallback( context ) )
				return true;

		}

		if( _TOKEN_STATE_NONE == context.state ) {
			context.chars = [ newChar ];
			if( "a" <= newChar && newChar <= "z"
			  || "A" <= newChar && newChar <= "Z"
			  || "_" === newChar )
				context.state = _TOKEN_STATE_IDENTIFIER;
			else if( "0" <= newChar && newChar <= "9" )
				context.state = _TOKEN_STATE_NUMBER;
			else if( "\"" == newChar )
				context.state = _TOKEN_STATE_STRING1_CHAR;
			else if( "'" == newChar )
				context.state = _TOKEN_STATE_STRING2_CHAR;
			else if( "/" == newChar )
				context.state = _TOKEN_STATE_SLASH;
			else if( -1 < _TOKEN_SYMBOL_LIST.indexOf( newChar ) ) {
				context.state = _TOKEN_STATE_SYMBOL;
				if( _tokenizerCallback( context ) )
					return true;
				/* REMARK: did not find a nicer way to handle that!
						In that particular case, I must update context.pos & context.column
						as they will be incremented *after* this call
				*/
				++context.pos;
				++context.column;
			} else if( -1 < _TOKEN_SPACE_LIST.indexOf( newChar ) ) {
				context.state = _TOKEN_STATE_SPACE;
			} else if( _tokenizerCallback( context, _TOKEN_ERROR_UTOKEN ) )
				return true;
		}

		return false;
	},

	_tokenizerFinalize = function( context ) {
		if( _TOKEN_STATE_IDENTIFIER === context.state
			|| _TOKEN_STATE_NUMBER === context.state
			|| _TOKEN_STATE_LCOMMENT === context.state ) _tokenizerCallback( context );
		else if( _TOKEN_STATE_SLASH === context.state ) {
			context.state = _TOKEN_STATE_SYMBOL;
			_tokenizerCallback( context );
		} else if( _TOKEN_STATE_COMMENT === context.state )
			_tokenizerCallback( context, _TOKEN_ERROR_USTRING );
		else if( _TOKEN_STATE_STRING1_CHAR === context.state
					|| _TOKEN_STATE_STRING2_CHAR === context.state
					|| _TOKEN_STATE_STRING1_ESCAPE === context.state
					|| _TOKEN_STATE_STRING2_ESCAPE === context.state )
			_tokenizerCallback( context, _TOKEN_ERROR_USTRING );
	}
;

gpf.extend( gpf, {

	tokenize: function( text, cbOnToken ) {
		/*
		 * text: string
		 * cbOnToken: function( type, token, context ): boolean

			Parse the provided 'text' to extract javascript tokens.
			Whenever a token is found, the callback 'cbOnToken' is called  with the
			type and value of the token. context is an object containing the following
			members: {
				pos: number,		// Absolute position of the error (0-based)
				line: number,		// Absolute line position of the error (0-based)
				column: number, // Column position relatively to the current line (0-based)
				code: number,		// Error code (0 if token found)
				message: string // Error message (empty if token found)
			}
			The current object (this) is transmitted.

			If an error occurs, 'cbOnToken' is called with type set to "error", token
			will contain an english error message. The context object will have code
			and message set accordingly.

			If the callback function does not return true when the error is thrown,
			the parsing continue (the parsing context is cancelled and the error is
			ignored).
			
			At anytime, if the callback function returns true an error is raised 
			(code XXX) and the parsing is stopped (whatever the callback function
			result).
		*/
		var context = _tokenizerInit();
		context.callback = cbOnToken;
		context.that = this;
		for( var idx = 0, len = text.length; idx < len; ++idx ) {
			if( _tokenizeChar( context, text.charAt( idx ) ) )
				break;
		}
		_tokenizerFinalize( context );
	},

	tokenizeEx: function( text, cbOnToken, context ) {
		/*
		 * text: string
		 * cbOnToken: function( type, token, context ): boolean
		 * [context]: object
		 * return object

			Parse the provided 'text' to extract javascript tokens.
			Whenever a token is found, the callback 'cbOnToken' is called  with the
			type and value of the token. context is an object containing the following
			members: {
				pos: number,		// Absolute position of the error (0-based)
				line: number,		// Absolute line position of the error (0-based)
				column: number, // Column position relatively to the current line (0-based)
				code: number,		// Error code (0 if token found)
				message: string // Error message (empty if token found)
			}
			The current object (this) is transmitted.

			Parsing is chained by getting the returned object on first call and
			pass it to the 'context' parameter.
			It is terminated by calling the function with 'text' being null.

			If an error occurs, 'cbOnToken' is called with type set to "error", token
			will contain an english error message. The context object will have code
			and message set accordingly.

			If the callback function does not return true when the error is thrown,
			the parsing continue (the parsing context is cancelled and the error is
			ignored).
			
			At anytime, if the callback function returns true an error is raised 
			(code XXX) and the parsing is stopped (whatever the callback function
			result).
		*/
		if( undefined === context ) context = _tokenizerInit();
		context.callback = cbOnToken;
		context.that = this;
		if( null === text ) _tokenizerFinalize( context );
		else for( var idx = 0, len = text.length; idx < len; ++idx ) {
			if( _tokenizeChar( context, text.charAt( idx ) ) )
				break;
		}
		return context;
	}

} );

})(); /* End of privacy scope */
