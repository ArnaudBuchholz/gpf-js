(function(){ /* Begin of privacy scope */

gpf.declareTests( {

	"replaceEx": [

		function( ctx ) {
			ctx.result = gpf.replaceEx( "abc", {
				"a": "abc",
				"b": "dc",
				"c": ""
			} );
			return ctx.result === "add";
		}

	],

	"escapeFor": [

		function( ctx ) {
			ctx.result = gpf.escapeFor( "abc\r\ndef", "jscript" );
			return ctx.result === "\"abc\\r\\ndef\"";
		},

		function( ctx ) {
			ctx.result = gpf.escapeFor( "<a&b>", "xml" );
			return ctx.result === "&lt;a&amp;b&gt;";
		},

		function( ctx ) {
			ctx.result = gpf.escapeFor( "<a&b:éèêáà>", "html" );
			return ctx.result === "&lt;a&amp;b:&eacute;&egrave;&ecirc;&aacute;&agrave;&gt;";
		}
	]


} );

} )(); /* End of privacy scope */
