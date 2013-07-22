(function(){ /* Begin of privacy scope */

// Class inspired by http://ejohn.org/blog/simple-javascript-inheritance
var
	_classInit = false,
	/*
		09/07/2013 22:59:59 ABZ
			The original code from J.Reisig is using the following test
			/xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.<star>/;
			However, this breaks the release compiler and, as far as understand it,
			it forces the use of _super when the /xyz/.test(function...) fails.
			I propose a version that does not break the compiler *and* is more
			efficient if the initial test fails. 
	*/
	_reSuper = new RegExp( "\\b_super\\b" ),
	_classFnUsesSuper = (function(){
		if( _reSuper.test( function(){this._super();} ) )
			return function(){ return _reSuper.test( arguments[0] ); };
		else
			return function(){ return -1 < (""+arguments[0]).indexOf( "_super" ); };
	})();

// The base Class implementation
gpf.Class = function Class(){};

// Create a new Class that inherits from this class
gpf.Class.extend = function( properties ) {
	/*
	 * properties: object
	 * return function

		Create a new class that contains properties.
	*/
	var
		_super = this.prototype,
		newPrototype,
		newClass,
		member,
		attributeName;

	// Instantiate a base class (but only create the instance,
	// don't run the init constructor)
	
/*__begin__thread_safe__*/
	_classInit = true;
	var newPrototype = new this();
	_classInit = false;
/*__end_thread_safe__*/

	/* Defines the link to the parent class
		It is necessary to do it here because of the gpf.addAttributes that will
		test this parent class
	*/
	newPrototype.baseClass = this;

	// Copy the properties over onto the new prototype
	for( member in properties )
	{
		if( member === "baseClass" ) continue; // Forbidden to override

		/* Attributes placeholder
			Most of the functions used below are defined *later*:
			- gpf.addAttributes comes from attributes.js
			- gpf.ClassAttributeError comes from att_class.js
		*/
		if( "[" === member.charAt( 0 ) && "]" === member.charAt( member.length - 1 ) ) {
			attributeName = member.substr( 1, member.length - 2 );
			if( attributeName in properties || attributeName in newPrototype
			    || attributeName === "Class" )
				gpf.addAttributes( newPrototype, attributeName, properties[ member ] );
			else
				throw new gpf.ClassAttributeError( 0, attributeName );
		}

		// Check if we're overwriting an existing function
		else if( "function" === typeof properties[ member ]
		         && "function" === typeof _super[ member ]
		         && _classFnUsesSuper( properties[ member ] ) )
			/*
				Create a bootstrap before calling new method that redefines
				the identifier _super to match the inherited method.
			*/
			newPrototype[ member ] = (function( member, method ){
					return function() {
						var
							backup = this._super,
							result;
						/*
							Add a new ._super() method that is the same method
							but on the super-class
						*/
						this._super = _super[ member ];
						/*
							The method only need to be bound temporarily, so we
							remove it when we're done executing
						*/
						try {
							result = method.apply( this, arguments );
						} catch( e ) {
							throw e;
						} finally {
							this._super = backup;
						}
						return result;
					};
				})( member, properties[ member ] );
		else
			newPrototype[ member ] = properties[ member ];
	}

	// The new class constructor
	newClass = function(){
		if( !_classInit && "function" === typeof this.init )
			this.init.apply( this, arguments );
	};

	// Populate our constructed prototype object
	newClass.prototype = newPrototype;

	// Enforce the constructor to be what we expect
	newPrototype.constructor = newClass;

	// And make this class extendable
	newClass.extend = arguments.callee;

	return newClass;
};

})(); /* End of privacy scope */
