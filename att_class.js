(function(){ /* Begin of privacy scope */

/*__rewriter_replace_with_values:on*/
var/*private*//*const*/

	_ATTCLASS_ERROR_BASE_				= 0,
	_ATTCLASS_ERROR_NOTAMEMBER	= 0,
	_ATTCLASS_ERROR_RO					= 1,

/*__rewriter_replace_with_values:off*/

	_ATTCLASS_ERRORS = [
		  "Not a member"
		, "Read only member"
	],

	_ro_property = function( member ) {

	/* 08/07/2013 13:57:41 ABZ
		I initially thought about inserting an ASSERT here in order to verify that
		the R/O member is not called with a parameter.
		However, this has several drawbacks:
		- Automated tests are throwing an ASSERT where they should not (If I want to
		  test that trying to modify a read-only attribute does not alter it)
		- This assertion would not disappear in RELEASE mode as the function
		  gpf.ASSERT does not really exist (unless I create a closure, thing that I
			want to avoid)
		So I dediced to throw a real error instead.

		10/07/2013 13:12:39 ABZ
			When creating a function with new Function, the current context is not
			available. Replacing directly with the correct error code.
	*/
		return new Function( "if( 0 !== arguments.length ) throw new gpf.ClassAttributeError( 1, \"" + member + "\" ); return this." + member + ";" );
	},

	_rw_property = function( member ) {
		return new Function( "var r = this." + member
			+ "; if( 0 < arguments.length ) this." + member
			+ " = arguments[0]; return r;" );
	}
;

gpf.ClassAttributeError = gpf.Error.extend( {

	_member: 0,

	init: function( error, member ) {
		this._super( _ATTCLASS_ERRORS[ _ATTCLASS_ERROR_BASE_ + error ],
			"ClassAttributeError" );
		this._member = member;
	},

	member: function() {
		return this._member;
	}

} );

gpf.ClassAttribute = gpf.Attribute.extend( {
} );

gpf.ClassPropertyAttribute = gpf.ClassAttribute.extend( {

	_writeAllowed: false,
	_publicName: "",

	init: function( writeAllowed, publicName ) {
		if( writeAllowed )
			this._writeAllowed = true;
		if( "string" === typeof publicName )
			this._publicName = publicName;
	},

	alterPrototype: function( objPrototype ) {
		var
			member = this._member,
			publicName = this._publicName;
		if( !publicName )
			publicName = member.substr(1); // Considering it starts with _
		if( this._writeAllowed )
			objPrototype[ publicName ] = _rw_property( member );
		else
			objPrototype[ publicName ] = _ro_property( member );
	}

} );

gpf.ClassExtensionAttribute = gpf.ClassAttribute.extend( {

	_ofClass: 0,
	_publicName: "",

	init: function( ofClass, publicName ) {
    this._ofClass = ofClass;
		if( "string" === typeof publicName )
			this._publicName = publicName;
	}

} );

gpf.Attribute.declare( gpf.ClassAttribute );

} )(); /* End of privacy scope */
