(function(){ /* Begin of privacy scope */

/*
	This package contains general helpers that will be used everywhere else
*/

gpf.each = function( dictionary, memberCallback, defaultResult ) {
	/*
	 * dictionary: object
	 * memberCallback: function( member, value )
	 * [defaultResult]: any
	 * return any

		Enumerate 'dictionary' members and call 'memberCallback' for each of them.
		If 'defaultResult' is defined, 'memberCallback' may return a result.
		If 'memberCallback' returns anything, the function stops and returns it.
		Otherwise, the 'defaultResult' is returned.
		When 'defaultResult' is not defined, 'memberCallback' result is ignored.
	*/
	var
		result,
		member,
		value;
	if( undefined === defaultResult )
		for( member in dictionary )
			memberCallback.apply( this, [ member, dictionary[ member ] ] );
	else
		for( member in dictionary ) {
			value = dictionary[ member ];
			result = memberCallback.apply( this, [ member, value ] );
			if( undefined != result )
				return result;
		}
	return defaultResult;
};

var/*private*//*const*/

	_assign = function( member, value ) {
		// this = gpf.extend's arguments
		var/*alias*/
			dictionary = this[ 0 ];
		dictionary[ member ] = value;
	},

	_assign_or_call = function( member, value ) {
		// this = gpf.extend's arguments
		var/*alias*/
			dictionary = this[ 0 ],
			overwriteCallback = this[ 2 ];
		var existing = dictionary[ member ];
		if( undefined === existing )
			dictionary[ member ] =  value;
		else
			overwriteCallback( dictionary, member, value );
	}
;

gpf.extend = function( dictionary, additionalProperties, overwriteCallback ) {
	/*
	 * dictionary: object
	 * additionalProperties: object
	 * overwriteCallback: function( dictionary, member, newValue )
	 * return 'dictionary'

		Appends members of 'additionalProperties' to the 'dictionary' object.
		If a conflict has to be handled (i.e. member exists on both objects),
		the 'overwriteCallback' has to handle it.
	*/
	var callbackToUse;
	if( undefined === overwriteCallback )
		callbackToUse = _assign;
	else
		callbackToUse = _assign_or_call;
	gpf.each.apply( arguments, [ additionalProperties, callbackToUse ] );
	return dictionary;
};

var/*private*//*const*/
	_b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
	_b16 = "0123456789ABCDEF",
	_equalSearchInDone = function( array, a, b ) {
		for( var idx in array ) {
			if( array[ idx ].a === a && array[ idx ].b === b
				|| array[ idx ].b === a && array[ idx ].a === b )
					return idx;
		}
		return undefined;
	}
;


// Shortcut to declare other members
gpf.extend( gpf, {

	value: function( value, defaultValue, expectedType ) {
		/*
		 * value: any
		 * defaultValue: any
		 * [expectedType]: string
		 * return any
	
			Converts 'value' to the 'expectedType'.
			If not specified or impossible to do so, 'defaultValue' is returned.
			When 'expectedType' is not provided, it is deduced from 'defaultValue'.
		*/
		if( !expectedType )
			expectedType = typeof defaultValue;
		var valueType = typeof value;
		if( expectedType === valueType )
			return value;
		if( "undefined" === valueType || !value )
			return defaultValue;
		if( "boolean" == expectedType ) {
			if( "string" == valueType ) {
				if( "yes" == value
					|| "true" == value )
					return true;
				else
					return 0 != parseInt( value );
			}
			else if( "number" == valueType )
				return 0 != value;
		}
		else if( "number" == expectedType ) {
			if( "string" == valueType )
				return parseFloat( value );
		}
		return defaultValue;
	},

	equal: function( a, b /*, ignoreList */ ) {
		/*
		 * a: any
		 * b: any
		 * return boolean

			Compares a and b and return true if they are strictly equal.

			NOTES:
			14/04/2013 17:19:43
			Generates too much recursion, changed the algorithm to avoid recursion/
			Using document.body (and any kind of object that references other objects)
			I found that it was necessary to keep track of already processed objects.
			14/04/2013 23:27:36
			Added an attribute ignoreList to troubleshoot using DOM elements.
			Deactivated after the test.
		*/
		if( a === b )
			return true;
		if( typeof a != typeof b )
			return false;
		if( null === a || null === b || "object" !== typeof a )
			return false;
		var
			member,
			count,
			ma, mb,
			done = [],
			stack = [ a, b ];
		while( 0 !== stack.length ) {
			b = stack.pop();
			a = stack.pop();
			done.push( { a: a, b: b } );
			if( a.prototype !== b.prototype )
				return false;
			count = 0;
			for( member in a ) {
				if( member === "prototype" )
					continue; // Already tested above
//				if( undefined !== ignoreList && undefined !== gpf.test( ignoreList, member ) )
//					continue; // Ignored member
				++count;
				ma = a[ member ];
				mb = b[ member ];
				if( ma === mb ) continue; // It works when the same object/type
				if( typeof ma !== typeof mb ) // {
//					console.log( "gpf.equal failed on " + member + " type" );
					return false;
//				}
				if( null === ma || null === mb || "object" !== typeof ma ) // {
//					console.log( "gpf.equal failed on " + member + " value" );
					return false; // Because we know that ma !== mb
//				}
				if( undefined == _equalSearchInDone( done, ma, mb ) ) {
					stack.push( ma );
					stack.push( mb );
				}
			}
/*
			if( undefined !== ignoreList ) {
				for( member in b ) {
					if( member === "prototype" ) continue; // Already tested above
					if( undefined !== gpf.test( ignoreList, member ) )
						continue; // Ignored member
					if( undefined === a[ member ] )
					{
						console.log( "gpf.equal failed on " + member );
						return false;
					}
					--count;
				}
			}
			else
*/
			for( member in b ) --count;
			if( 0 !== count ) // {
//				console.log( "gpf.equal failed on member count: " + count );
				return false;
//			}
		}
		return true;
	},

// 17/04/2013 13:13:01
// DISABLED as not usefull (and not complete)
//	clone: function( obj ) {
//		/*
//		 * obj: object
//		 * return object
//
//			Create a new object (same constructor) and duplicates its properties.
//		*/
//		var
//			result = new obj.constructor(),
//			property, value;
//		for( property in obj )
//		{
//			value = obj[ property ];
//			if( "function" !== typeof value )
//				result[ property ] = value;
//		}
//		return result;
//	},

	toBaseANY: function( base, value, length, safepad ) {
		/*
		 * base: string
		 * value: number
		 * [length]: number
		 * [safepad]: string
		 * return string

			Encodes the 'value' within the specified 'base'.
			Result string 'length' can be defined and missing characters will be
			added with 'safepad'. 		 
		*/		 
		var
			baseLength = base.length,
			result = [],
			digit;
		while( 0 < value ) {
			digit = value % baseLength;
			result.unshift( base.charAt( digit ) );
			value = ( value - digit ) / baseLength; 
		}
		if( undefined != length ) {
			if( undefined == safepad ) safepad = base.charAt(0);
			while( result.length < length )
				result.unshift( safepad.charAt( Math.floor( safepad.length * Math.random() ) ) );
		}
		else if( 0 == result.length )
			result = [ base.charAt(0) ]; // 0
		return result.join("");
	},

	fromBaseANY: function( base, text, safepad ) {
		/*
		 * base: string
		 * text: string
		 * [safepad]: string		 		 
		 * return number

			Decodes the 'text' using the specified 'base'.
		*/		 
		var
			baseLength = base.length,
			result = 0,
			idx = 0,
			matchIdx;
		if( undefined == safepad ) safepad = base.charAt(0);
		while( idx < text.length )
			if( -1 == safepad.indexOf( text.charAt( idx ) ) )
				break;
			else
				++idx;
		while( idx < text.length )
			result = baseLength * result + base.indexOf( text.charAt( idx++ ) );
		return result;
	},

	toHexa: function( value, length, safepad ) {
		/*
		 * value: number
		 * [length]: number
		 * [safepad]: string		 		 
		 * return string

		 	Returns the hexadecimal encoding of 'value'.
		*/		 
		return gpf.toBaseANY( _b16, value, length, safepad );
	},

	fromHexa: function( text, safepad ) {
		/*
		 * text: string
		 * [safepad]: string		 		 
		 * return number

			Decodes the hexadecimal 'text' value.
		*/		 
		return gpf.fromBaseANY( _b16, text, safepad );
	},

	toBase64: function( value, length, safepad ) {
		/*
		 * value: number
		 * [length]: number
		 * [safepad]: string
		 * return string

		 	Returns the base 64 encoding of 'value'.
		*/		 
		return gpf.toBaseANY( _b64, value, length, safepad );
	},

	fromBase64: function( text, safepad ) {
		/*
		 * text: string
		 * [safepad]: string
		 * return number

			Decodes the hexadecimal 'text' value.
		*/
		return gpf.fromBaseANY( _b64, text, safepad );
	},

	test: function( dictionary, value ) {
		/*
		 * dictionary: object/array
		 * value: any
		 * return number
		 
			Find the member of 'dictionary' which value equals to 'value'.
		*/		 
		for( var idx in dictionary )
			if( dictionary[ idx ] === value )
				return idx;
		return undefined;
	},

	set: function( array, value ) {
		/*
		 * dictionary: array
		 * value: any
		 * return array

			Inserts the 'value' in the 'array' if not already present.  
		*/
		gpf.ASSERT( array instanceof Array, "gpf.set must be used with an Array" );
		for( var idx in array )
			if( array[ idx ] === value )
				return array; /* Already set */
		array.push( value );
		return array;
	},

	clear: function( dictionary, value ) {
		/*
		 * dictionary: object/array
		 * value: any
		 * return array

			Removes the member of 'dictionary' which value equals 'value'.
			NOTE: that the object is modified. 
		*/		 
		for( var idx in dictionary )
			if( dictionary[ idx ] === value ) {
				if( dictionary instanceof Array )
					dictionary.splice( idx, 1 );
				else
					delete dictionary[ idx ];
				break;
			}
		return dictionary;
	},

	load: function( url, type ) {
		/*
		 * url: string
		 * type: string
		 * return string/object

			Synchronously load the content resource at 'url'.
		*/
		var xhttp;
		if( window.XMLHttpRequest )
			xhttp = new XMLHttpRequest();
		else
			xhttp = new ActiveXObject( "Microsoft.XMLHTTP" );
		xhttp.open( "GET", url, false );
		xhttp.send();
		if( "xml" == type || "application/xml" == type )
			return xhttp.responseXML;
		else
			return xhttp.responseText;
	},

	defer: function( callback, timeout ) {
		if( undefined == timeout )
			timeout = 0;
		window.setTimeout( callback, timeout ); 
	}

} );

})(); /* End of privacy scope */
