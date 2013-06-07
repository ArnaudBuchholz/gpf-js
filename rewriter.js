var
	  OPTION_SUBSTITUTE					= true
	, OPTION_KEEPFORMATTING			= false

	, VAR_ITEMS = "abcdefghijklmnopqrstuvwxyz"
;

var
	rewriter = {

		_src: [],

		// Used to read the final source
		read: function() {
			return this._src.join("");
		},

		// Used to include constant - non rewritten - source
		include: function( s ) {
			this._src.push( s );
		},

		// 'Trace' helper: when set after a call, it outputs the content and clears it
		_trace: "",
		trace: function() {
			var result = this._trace;
			this._trace = "";
			return result;
		},

		_ignoreToken: false,		// Ignore token: not included in final source
		_replaceToken: "",			// Replace token: substituted in final source

		// Mark the current position, may be followed by _cleanToMark
		_markedPos: -1,

		_mark: function() {
			this._markedPos = this._src.length;
		},

		_cleanToMark: function( ignoreToken ) {
			while( this._src.length > this._markedPos ) this._src.pop();
			if( ignoreToken ) this._ignoreToken = true;
		},

		/*
			Whenever parsing is recursive (function of function...)
			This stack maintain the last states/parameters and allow to push/pop contextes
		*/
		_stack: [],
		stackSize: function() {
			return this._stack.length;
		},

		_stateProperties: [ "state", "brackets", "varIdx", "variables" ],

		_state: 0,
		state: function() {
			return this._state;
		},

		_brackets: 0,
		brackets: function() {
			return this._brackets;
		},

		// Variables substitution management
		_varIdx: 0,
		_variables: {},
		_stored: {}, // NOT included in stack!

		// Used for __rewriter_replace_with_values:on
		_replace_with_values: false,
		_replace_identifier: "",
		_replace_lastType: "",
		_replace_lastToken: "",

		_getVarName: function( token, reason ) {
			var
				// Check any previous stored positions
				stored = this._stored[ token ],
				// Allocate a name 
				varIdx = this._varIdx % VAR_ITEMS.length,
				result = [];
			if( this._varIdx >= VAR_ITEMS.length )
				result.push( VAR_ITEMS.charAt( ( this._varIdx - varIdx ) / VAR_ITEMS.length - 1 ) );
			result.push( VAR_ITEMS.charAt( varIdx ) );
			if( this._stack.length )
				result.push( this._stack.length );
			result = result.join( "" );
			++this._varIdx;
			// Store it & substitute
			this._variables[ token ] = result;
			this._trace = "=" + reason + ":" + result;
			if( OPTION_SUBSTITUTE ) {
				this._replaceToken = result;
				if( undefined !== stored ) {
					this._trace += "/stored";
					for( var idx in stored ) {
						var position = stored[ idx ];
						this._src[ position ] = result;
					}
				}
			}
			return result;
		},

		_storeVarName: function( token ) {

			this._stored[ token ] = [];
			var position = this._src.length - 1;
			while( position >= 0 && this._src[ position ] !== token )
				--position;
			if( 0 <= position )
				this._stored[ token ].push( position );
			this._trace = "stored(" + position + "):" + token;

		},

		// Helper to concentrate variable substitution
		_lastReplaceableVarName: "",
		_remapVarName: function( token ) {

			// reserved 'keywords'
			if( undefined != gpf.test( [ "true", "false", "undefined",
				"arguments", "parseInt", "parseFloat", "null", "Math",
				"window", "document", "XMLHttpRequest", "ActiveXObject",
				"Array", "String", "Date" ], token ) ) return;

			if( this._lastToken === "." )
				this._trace = "<safe>";
			else if( undefined === this._variables[ token ] ) {

				if( undefined === this._stored[ token ] )
					this._lastReplaceableVarName = token;
				else
					this._stored[ token ].push( this._src.length );

			} else {

				if( OPTION_SUBSTITUTE ) this._replaceToken = this._variables[ token ];
				this._trace = "=" + this._variables[ token ];

			}
		},

		// 'basic' object cloning
		_clone: function( obj ) {
			var result = {};
			for( var property in obj ) {
				var value = obj[ property ];
				if( "object" === typeof value )
					value = this._clone( value );
				result[ property ] = value;
			}
			return result;
		},

		_push: function() {
			var item = {};
			for( var idx in this._stateProperties ) {
				var property = "_" + this._stateProperties[ idx ];
				var value = this[ property ];
				var type = typeof value;
				if( "object" === type ) value = this._clone( value );
				item[ property ] = value;
			}
			this._stack.push( item );
			// Update some variables
			this._varIdx = 0;
		},

		_pop: function() {
			var item = this._stack.pop();
			for( var idx in this._stateProperties ) {
				var property = "_" + this._stateProperties[ idx ];
				this[ property ] = item[ property ];
			}
		},

		// Last encountered tokens
		_lastType: "",
		_lastToken: "",

		process: function( type, token ) {

			/* Condensed version */
			this._state = this._states[ this._state ].apply( this, [ type, token ] );

			if( this._ignoreToken ) {

				this._ignoreToken = false;
				return;

			} else if( this._replaceToken ) {

				token = this._replaceToken;
				this._replaceToken = "";
 
			}

			if( "comment" === type ) {

				// Normally ignored but used to modify the behavior of the rewriter
				if( -1 < token.indexOf( "__rewriter" ) ) {

					var
						pos = token.indexOf( "__rewriter" ),
						tokens = token.substr( pos + 10 ).split( ":" ),
						command = tokens[0],
						booleanValue = 0 == tokens[1].indexOf( "on" );

					if( command in this ) {
						this[ command ] = booleanValue;
						this._trace = command + "=" + booleanValue;
					}

				}

			} else if( "space" !== type ) {

				if( !OPTION_KEEPFORMATTING ) {
					// Manual handling of spaces
					if( "identifier" === this._lastType && "keyword" === type
						|| "keyword" === this._lastType && "identifier" === type
						|| "keyword" === this._lastType && "keyword" === type
						|| "keyword" === this._lastType && "return" === this._lastToken && "number" === type
					)
						this._src.push( " " );
				}

				if( this._lastReplaceableVarName !== ""
					  && token != this._lastReplaceableVarName ) {

					if( "symbol" !== type || ":" !== token )
						/*
							This part is tricky: sometimes the variable declaration is done
							after the use. So we associate the current position (will look
							backward) to be able to replace it *afterward*
						*/
						this._storeVarName( this._lastReplaceableVarName );

					this._lastReplaceableVarName = "";
				}

				this._lastType = type;
				this._lastToken =  token;
				this._src.push( token );

			} else if( OPTION_KEEPFORMATTING ) this._src.push( token );

		},

		_states: [

// (0) "function" -> (1)
// else (0)
function( type, token ) {

	if( "keyword" === type && "function" === token )
		return 1;
	return 0;

},

// (1) [identifier] -> (2)
// (1) "(" -> (3)
function( type, token ) {

	if( "identifier" === type )
		return 2;
	else if( "symbol" === type && "(" === token )
		return 3;
	else if( "space" === type || "comment" === type )
		return 1;
	else
		return -1;

},

// (2) "(" -> (3)
function( type, token ) {

	if( "symbol" === type && "(" === token )
		return 3;
	else if( "space" === type || "comment" === type )
		return 2;
	else
		return -1;

},

// (3) ")" -> (5)
// (3) identifier -> (4)
function( type, token ) {

	if( "symbol" === type && ")" === token )
		return 5;
	else if( "identifier" === type ) {
		// Parameter of a function
		this._getVarName( token, "parameter" );
		return 4;
	}
	else if( "space" === type || "comment" === type )
		return 3;
	else
		return -1;

},


// (4) ")" -> (5)
// (4) "," -> (3)
function( type, token ) {

	if( "symbol" === type && ")" === token )
		return 5;
	else if( "symbol" === type && "," === token )
		return 3;
	else if( "space" === type || "comment" === type )
		return 4;
	else
		return -1;

},

// (5) "{" -> (6)
function( type, token ) {

	if( "symbol" === type && "{" === token ) {
		this._brackets = 1;
		return 6;
	}
	else if( "space" === type || "comment" === type )
		return 5;
	else
		return -1;

},


// (6) var -> (7)
// (6) gpf -> (9)
// (6) "}" -> (0)
// (6) function -> (1)
// (6) "." -> (15) to avoid identifier substitution
// else (6)
function( type, token ) {

	if( "keyword" === type && "var" === token )
		return 7;
	else if( "identifier" === type && "gpf" === token ) {

		this._mark();
		return 9;

	} else if( "keyword" == type && "function" == token ) {

		this._push();
		return 1;

	} else if( "symbol" === type && "{" === token ) {

		++this._brackets;
		return 6;

	} else if( "symbol" === type && "}" === token ) {

		if( --this._brackets ) return 6;
		if( 0 < this._stack.length ) {

			this._pop();
			return this._state;

		} else {

			// Back to the initial state
			this._varIdx = 0;
			this._variables = {};
			return 0;

		}

	} else if( "identifier" === type ) {

		this._remapVarName( token );
		return 6;

	} else if( "space" === type || "comment" === type )
		return 6;
	// Ignore
	else
		return 6;

},

// (7) identifier -> (8)
function( type, token ) {

	if( "identifier" === type ) {

		if( this._replace_with_values ) {
			this._mark();
			this._replace_lastType = this._lastType;
			this._replace_lastToken = this._lastToken;
			this._replace_identifier = token;
		}
		else
			// Variable
			this._getVarName( token, "variable" );
		return 8;
	}
	else if( "space" === type || "comment" === type )
		return 7;
	else
		return -1;

},

// (8) "," -> (7)
// (8) ";" -> (6)
// (8) "=" -> (14)
// (8) in -> (6)
function( type, token ) {

	if( "symbol" === type && "," === token )
		return 7;
	else if( "symbol" === type && ";" === token )
		return 6;
	else if( "symbol" === type && "=" === token ) {
		this._push();
		this._brackets = 0;
		return 14;
	}
	else if( "keyword" === type && "in" === token )
		return 6;
	else if( "space" === type || "comment" === type )
		return 8;
	else
		return -1;

},

// (9) "." -> (10)
// (9) -> (6)
function( type, token ) {

	if( "symbol" === type && "." === token )
		return 10;
	else if( "space" === type || "comment" === type )
		return 9;
	else
		return 6;

},

// (10) "ASSERT" -> (11)
// (10) -> (6)
function( type, token ) {

	if( "identifier" === type && "ASSERT" === token )
		return 11;
	else if( "space" === type || "comment" === type )
		return 10;
	else
		return 6;

},

// (11) "(" -> (12)
function( type, token ) {

	if( "symbol" === type && "(" === token ) {

		this._push();
		this._brackets = 1;
		return 12;

	} else if( "space" === type || "comment" === type )
		return 12;
	else
		return 6;

},

// (12) ... ")" -> (13)
function( type, token ) {

	if( "symbol" === type && "(" === token )
		++this._brackets;
	else if( "symbol" === type && ")" === token && 0 == --this._brackets ) {

		this._pop();
		return 13;

	}
	return 12;

},

// (13) ";" -> (6)
function( type, token ) {

	if( "symbol" === type && ";" === token ) {

		this._cleanToMark( true ); // Ignore ;

	} else if( "space" === type || "comment" === type )
		return 13;
	return 6;

},

// (14) "," -> (7)
// (14) ";" -> (6)
// (14) function -> (1)
// else (14)
function( type, token ) {

	if( 0 === this._brackets ) {

		if( "symbol" === type && "," === token ) {

			this._pop();
			if( this._replace_with_values ) {
				this._trace = "replaced_with_value(";
				this._trace += this._replace_identifier + ",";
				// TODO: this doesn't work when the value needs more than one token
				this._trace += this._lastToken;	
				this._trace += ")";
				this._variables[ this._replace_identifier ] = this._lastToken;
				this._cleanToMark( true );
				// Replace last type & token to fit what happend when starting the replacement
				this._lastType = this._replace_lastType;
				this._lastToken = this._replace_lastToken;
			}
			return 7;

		} else if( "symbol" === type && ";" === token ) {

			this._pop();
			return 6

		} else if( "keyword" === type && "function" === token ) {

			this._push();
			return 1;

		}
	}

	if( "symbol" === type ) {

		if( "(" === token || "{" === token || "[" === token )
			++this._brackets;
		else if( ")" === token || "}" === token || "]" === token )
			--this._brackets;

	} else if( "identifier" == type )
		this._remapVarName( token );

	return 14;
}

		]

	};
