(function(){ /* Begin of privacy scope */

gpf.IReadOnlyArray = gpf.Interface.extend( {

	length: function() {
		/*
		 *

		 	Return the number of items in the array.
		*/
		return false;
	},

	get: function( idx ) {
		/*
		 * idx: number
		 
			Return the item inside the array which index is 'idx' (0-based) 
		*/
		return true;
	}

} );

gpf.IArray = gpf.IReadOnlyArray.extend( {

	set: function( idx, value ) {
		/*
		 * idx: number
		 * value: any
		 
			Set the item inside the array which index is 'idx' (0-based).
			Return the value that was previously set.
		*/
	}

} );

gpf.extend( gpf, {

	addReadOnlyArrayMethods: function( objClass, arrayMember ) {
		/*
		 * objClass: class
		 * arrayMember: string

			Add to the class 'objClass' the necessary methods to implemente the
			IReadOnlyArray interface. These methods are based on the array member
			'arrayMember'.
		*/
		gpf.ASSERT( "function" === typeof objClass );
		var objPrototype = objClass.prototype;
		gpf.addAttributes( objPrototype, "Class",
			[ gpf.$InterfaceImplement( gpf.IReadOnlyArray ) ] );
		objPrototype.length = new Function( "return this."
			+ arrayMember + ".length;" );
		objPrototype.get = new Function( "return this."
			+ arrayMember + "[arguments[0]];" );
	},

	addArrayMethods: function( objClass, arrayMember ) {
		/*
		 * objClass: class
		 * arrayMember: string

			Add to the class 'objClass' the necessary methods to implemente the
			IArray interface. These methods are based on the array member
			'arrayMember'.
		*/
		gpf.ASSERT( "function" === typeof objClass );
		var objPrototype = objClass.prototype;
		gpf.addAttributes( objPrototype, "Class",
			[ gpf.$InterfaceImplement( gpf.IArray ) ] );
		gpf.addReadOnlyArrayMethods( objClass, arrayMember );
		objClass.prototype.set = new Function( "var i=arguments[0],v=this."
			+ arrayMember + "[i];this."
			+ arrayMember + "[i]=arguments[1];return v;" );
	}

} );

// Process some of the existing interfaces
gpf.addReadOnlyArrayMethods( gpf.AttributesArray, "_array" );

})(); /* End of privacy scope */
