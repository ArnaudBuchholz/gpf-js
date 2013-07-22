(function(){ /* Begin of privacy scope */

var
	_z = function( x ) {
		if( 10 > x )
			return "0" + x;
		else
			return x;
	}
;

gpf.extend( gpf, {

	"[dateToComparableFormat]": [ gpf.$ClassExtension( Date, "toComparableFormat" ) ],
	dateToComparableFormat: function( date, includeTime ) {
		if( undefined === includeTime )
			includeTime = 1;
		var
			result = [ date.getFullYear(), "-", _z( date.getMonth() + 1 ), "-",
				_z( date.getDate() ) ];
		if( includeTime )
			result.push( " ", _z( date.getHours() ), ":", _z( date.getMinutes() ),
				":", _z( date.getSeconds() ) );
		return result.join( "" );
	},

	"[dateFromComparableFormat]": [ gpf.$ClassExtension( String ) ],
	dateFromComparableFormat: function( str ) {
		var
			date = new Date();
/*
		try
		{
*/
			date.setFullYear( parseInt( str.substr( 0, 4 ), 10 ),
				parseInt( str.substr( 5, 2 ), 10 ) - 1,
				parseInt( str.substr( 8, 2 ), 10 ) );
			if( 10 < str.length )
				date.setHours( parseInt( str.substr( 11, 2 ), 10 ),
					parseInt( str.substr( 14, 2 ), 10 ),
					parseInt( str.substr( 17, 2 ), 10 ), 0 );
			else
				date.setHours( 0, 0, 0, 0 );
/*
		}
		catch( e )
		{
			// 99% of chance this is an error with string length and/or number parsing
		}
*/
		return date;
	}

} );

})(); /* End of privacy scope */
