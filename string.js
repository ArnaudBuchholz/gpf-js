(function(){ /* Begin of privacy scope */

var/*private*//*const*/
	_escapes = {

		jscript: {
			"\"": "\\\"",
			"\n": "\\n",
			"\r": "\\r",
			"\t": "\\t"
		},

		xml: {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;"
		},

		html: {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			"é": "&eacute;",
			"è": "&egrave;",
			"ê": "&ecirc;",
			"á": "&aacute;",
			"à": "&agrave;"
		}

	}
;

gpf.extend( gpf, {

	/*
		14/07/2013 11:02:10 ABZ
			TODO: Find a way to benefit from the attributes mechanism on the GPF
			namespace
	*/
	"[replaceEx]": [ gpf.$ClassExtension( String ) ],
	replaceEx: function( str, replacements ) {
		/*
		 * str: string
		 * replacements: object
		 * return string

			Substitutes keys from the dictionary 'replacements' inside the string
			'str'. Returns the new string.
		*/
		// TODO: compare performances when using split/join
		var
			result = str,
			key,
			pos,
			intermediateResult;
		for( key in replacements ) {
			pos = result.indexOf( key );
			while( -1 != pos ) {
				intermediateResult = result.substr( 0, pos ) + replacements[ key ];
				result = intermediateResult + result.substr( pos + key.length );
				pos = result.indexOf( key, intermediateResult.length );
			}
		}
		return result;
	},

	"[escapeFor]": [ gpf.$ClassExtension( String ) ],
	escapeFor: function( str, language ) {
		/*
		 * str: string
		 * language: string
		 * return string

			Adapt the string content to be compatible with the provided 'language'.
			Returns the new string.
		*/
		var replacements = _escapes[ language ];
		if( undefined !== replacements ) {
			str = gpf.replaceEx( str, replacements );
			if( "jscript" === language )
				str = "\"" + str + "\"";
			/* TODO: handle UNICODE characters
				l = t.length;
				r = [];
				for( i = 0; i < l ; ++i )
				{
					c = t.charCodeAt( i );
					if( c < 128 )
						r.push( String.fromCharCode( c ) );
					else
						r.push( "&#" + c + ";" );
				}
				return r.join("");
			*/
		}
		return str;
	}

} );

})(); /* End of privacy scope */
