(function(){ /* Begin of privacy scope */

var
	tokenizeCB = function( type, token, context ) {

		++this.count;
		this.type = type;
		this.token = token;
		this.pos = context.pos;
		this.line = context.line;
		this.column = context.column;
		return this.result;

	},

	checkResult = function( ctx, count, type, token, pos, line, column ) {

		return count === ctx.count
					&& type === ctx.type
					&& ( undefined === token || token === ctx.token )
					&& pos === ctx.pos
					&& line === ctx.line
					&& column === ctx.column;

	}
;

gpf.declareTests( {

	"basic": [

		function( ctx ) {
			/* Basic parsing of a keyword */
			ctx.count = 0;
			ctx.result = false;
			gpf.tokenize.apply( ctx, [ "return", tokenizeCB ] );
			return checkResult( ctx, 1, "keyword", "return", 0, 0, 0 );
		},

		function( ctx ) {
			/* Basic parsing of an identifier with spacing */
			ctx.count = 0;
			ctx.result = false;
			gpf.tokenize.apply( ctx, [ "\t\r\n _identifier92", tokenizeCB ] );
			return checkResult( ctx, 2, "identifier", "_identifier92", 4, 1, 1 );
		},

		function( ctx ) {
			/* Basic parsing of a string with spacing */
			ctx.count = 0;
			ctx.result = false;
			gpf.tokenize.apply( ctx, [ "\n\n\t\t\"1\\\"3\"", tokenizeCB ] );
			return checkResult( ctx, 2, "string", "\"1\\\"3\"", 4, 2, 2 );
		},

		function( ctx ) {
			/* Basic parsing of a string with error */
			ctx.count = 0;
			ctx.result = false;
			gpf.tokenize.apply( ctx, [ "\"1\n3\"", tokenizeCB ] );
			return checkResult( ctx, 1, "error", undefined, 0, 0, 0 );
		},

		function( ctx ) {
			/* Basic error ignore */
			ctx.count = 0;
			ctx.result = false;
			gpf.tokenize.apply( ctx, [ "\"1", tokenizeCB ] );
			return checkResult( ctx, 1, "error", undefined, 0, 0, 0 );
		},

		function( ctx ) {
			/* Force error */
			ctx.count = 0;
			ctx.result = true;
			gpf.tokenize.apply( ctx, [ "return this", tokenizeCB ] );
			return checkResult( ctx, 2, "error", undefined, 0, 0, 0 );
		},

	],

	"advanced": [

		function( ctx ) {
			/* Parsing of a keyword in several parts */
			ctx.count = 0;
			ctx.result = false;
			var context = gpf.tokenizeEx.apply( ctx, [ "ret", tokenizeCB ] );
			gpf.tokenizeEx.apply( ctx, [ "urn", tokenizeCB, context ] );
			gpf.tokenizeEx.apply( ctx, [ null, tokenizeCB, context ] );
			return checkResult( ctx, 1, "keyword", "return", 0, 0, 0 );
		}

	]

} );

})(); /* End of privacy scope */
