(function(){ /* Begin of privacy scope */

gpf.Interface = gpf.Class.extend( {

	isImplementedBy: function( obj ) {

		var
			member;
		// Don't inspect the object prototype but the object itself,
		for( member in this ) {

			if( "isImplementedBy" === member	// from gpf.Interface
				|| "extend" === member )				// from gpf.Class
					continue;

			if( typeof this[ member ] !== typeof obj[ member ] )
				return false;
		}
		return true;
	}

} );

gpf.InterfaceAttribute = gpf.Attribute.extend( {
} );

gpf.InterfaceImplementAttribute = gpf.InterfaceAttribute.extend( {

	_interfaceDefinition: 0,

	init: function( interfaceDefinition ) {
		this._interfaceDefinition = interfaceDefinition;
	}

} );

gpf.Attribute.declare( gpf.InterfaceAttribute ); 

})(); /* End of privacy scope */
