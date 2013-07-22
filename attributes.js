(function(){ /* Begin of privacy scope */

var
	_attributes = {},
	_lastAttributeID = 0,
	_gpf_attributes = "_gpf_attributes",
	_emptyMember = 0
;

gpf.extend( gpf, {

	AttributesArray: gpf.Class.extend( {

		_array: [],

		init: function() {
			this._array = []; // Create a new instance of the array
		},

		has: function( expectedClass ) {
			/*
			 * expectedClass: function
			 * return object instanceof gpf.Attribute

				Return the first occurence of the expected class
			*/
			gpf.ASSERT( "function" === typeof expectedClass );
			var
				idx,
				item;
			for( idx in this._array ) {
				item = this._array[ idx ];
				if( item instanceof expectedClass )
					return item;
			}
			return null;
		},

		filter: function( expectedClass ) {
			/*
			 * expectedClass: function
			 * return object instanceof gpf.AttributesMap

				Restrict the array to the attributes being instances of expectedClass
			*/
			gpf.ASSERT( "function" === typeof expectedClass );
			var
				idx,
				attribute,
				result = new gpf.AttributesArray();
			for( idx in this._array ) {
				attribute = this._array[ idx ];
				if( attribute instanceof expectedClass )
					result._array.push( attribute );
			}
			return result;
		}

	} ),

	AttributesMap: gpf.Class.extend( {

		_members: {},
		_count: 0,

		init: function( obj ) {
			/* constructor
			 * [obj]: object

				Create a new attribute list and fill it with the attributes associated
				to the object class 
			*/
			this._members = {}; // Creates a new dictionary
			this._count = 0;
			if( undefined !== obj )
				this.fillFromObject( obj );
		},

		count: function() {
			return this._count;
		},

		add: function( member, attribute ) {
			/*
			 * member: string
			 * attribute: object instanceof gpf.Attribute
			 * return number
	
				Add the attribute to the current list.
				Returns the total number of attributes stored.
			*/
			var array = this._members[ member ];
			if( undefined === array )
				array = this._members[ member ] = new gpf.AttributesArray();
			array._array.push( attribute );
			++this._count;
		},

		_copyTo: function( attributesMap, callback, param ) {
			/* internal */
			var
				member,
				array,
				idx,
				attribute;
			if( this._count )
				for( member in this._members ) {
					array = this._members[ member ]._array;
					for( idx in array ) {
						attribute = array[ idx ];
						if( !callback || callback( member, attribute, param ) )
							attributesMap.add( member, attribute );
					}
				}
		},

		_filterCallback: function( member, attribute, expectedClass ) {
			/* internal */
			return attribute instanceof expectedClass;
		},

		fillFromObject: function( objInstance ) {
			/*
			 * objInstance: object
			 * return number

				Fill the attribute list with the attributes associated to the object.
				Returns the number of attributes.
			*/
			var
				objPrototype = objInstance.constructor.prototype,
				lastAttributesId = -1,
				attributesId,
				attributes;
			while( objPrototype ) {

				if( !( _gpf_attributes in objPrototype ) )
					break;

				attributesId = objPrototype[ _gpf_attributes ]();
				if( attributesId !== lastAttributesId ) {

					lastAttributesId = attributesId;
					attributes = _attributes[ attributesId ];
					attributes._copyTo( this );

				}
				objPrototype = objPrototype.baseClass.prototype;
			}
			return this._count;
		},

		filter: function( expectedClass ) {
			/*
			 * expectedClass: function
			 * return object instanceof gpf.AttributesMap

				Restrict the list to the attributes being instances of expectedClass
			*/
			gpf.ASSERT( "function" === typeof expectedClass );
			var result = new gpf.AttributesMap();
			this._copyTo( result, this._filterCallback, expectedClass );
			return result;
		},

		member: function( name ) {
			/*
			 * name: string
			 * return object instanceof gpf.AttributesArray

				Return the array of attributes related to the given 'member'.
			*/
			var
				result = this._members[ name ];
			if( undefined === result ) {
				if( 0 === _emptyMember )
					_emptyMember = new gpf.AttributesArray();
				result = _emptyMember;
			}
			return result;
		}

	} ),

	addAttributes: function( objPrototype, name, attributes ) {
		/* internal
		 * objPrototype: object
		 * name: string
		 * attributes: array of Attribute

			Add the attribute list to the prototype 'objPrototype' for member 'name'.
		*/

		/*__begin__thread_safe__*/
		// If not already done, associate the prototype to a unique attributes id
		var
			id = -1,
			attributeList,
			idx,
			attribute;

		/*
			By definition, if the prototype already owns an attributes ID,
			it may because of inheritence.
			Check if we have a baseClass and a different ID before deciding.   
		*/
		if( _gpf_attributes in objPrototype ) {
			id = objPrototype[ _gpf_attributes ]();
			if( objPrototype.baseClass && objPrototype.baseClass.prototype[ _gpf_attributes ] 
			    && objPrototype.baseClass.prototype[ _gpf_attributes ]() === id )
				id = -1;
		}
		if( -1 === id  ) {
			id = ++_lastAttributeID;
			objPrototype[ _gpf_attributes ] = new Function( "return " + id + ";" );
		}

		// If not already done, initiate the list of attributes for this id
		attributeList = _attributes[ id ];
		if( undefined === attributeList )
			attributeList = _attributes[ id ] = new gpf.AttributesMap();
		/*__end_thread_safe__*/
		for( idx in attributes ) {
			attribute = attributes[ idx ];
			attribute.member( name );
			attributeList.add( name, attribute );
			attribute.alterPrototype( objPrototype )
		}

	},

	// Must be the base class for any attribute
	Attribute: gpf.Class.extend( {

		_member: "",

		member: function( name ) {
			if( name )
				this._member = name;
			else
				return this._member;
		},

		alterPrototype: /*abstract*/ function( objPrototype ) {
		}

	} )

} );

gpf.Attribute.declare = function( baseClass ) {
		/* internal
		 * baseClass: function

			Declare attributes constructor within the gpf namespace according only
			for the provided baseClass
		*/

	var
		member,
		definition,
		newName;
	for( member in gpf ) {
		definition = gpf[ member ];
		if( "function" === typeof definition
			&& definition.prototype.baseClass === baseClass ) {

			/*
				Identified the correct member XXXAttribute,
				creates a $XXX that returns a new object of XXXAttribute 
				by transmitting parameters,

				It consist in creating an intermediate function like the following:
				(function(){
				
					function TransmitToXXX(args){
						return gpf.XXX.apply(this,args);
					}
					TransmitToXXX.prototype = XXX.prototype;
					return function(){
						return new TransmitToXXX( arguments );
					}
				
				})();
			*/
			newName = "$" + member.substr( 0, member.lastIndexOf( "Attribute" ) );
			// console.log( newName + "= new " + member );
			gpf[ newName ] = (new Function( "function t(a){return gpf." 
				+ member + ".apply(this,a);}t.prototype=gpf."
				+ member + ".prototype;return function(){return new t(arguments);}" ))();
		}
	}

}

})(); /* End of privacy scope */
