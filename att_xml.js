(function(){ /* Begin of privacy scope */

var/*private*//*const*/
	_selectByType = function( array, value ) {
		var
			idx,
			attribute,
			defaultResult = null,
			result = null;
		for( idx = 0; idx < array.length(); ++idx ) {
			attribute = array.get( idx );
			if( !( attribute instanceof gpf.XmlElementAttribute ) )
				continue;
			if( attribute.objClass() ) {
				if( value instanceof attribute.objClass() ) {
					/*
						If no result attribute has been set
						OR if the new attribute is a 'child' class of the existing result
							(meaning the new attribute is 'more' specific)
					*/
					if( !result
						|| attribute.objClass().prototype instanceof result.objClass() )
						result = attribute;
				}
			}
			else if( !defaultResult )
				defaultResult = attribute;
		}
		if( result )
			return result;
		else
			return defaultResult;
	},

	_selectByName = function( array, name ) {
		var
			idx,
			attribute,
			result = null;
		for( idx = 0; idx < array.length(); ++idx ) {
			attribute = array.get( idx );
			if( !( attribute instanceof gpf.XmlElementAttribute ) )
				continue;
			if( attribute.name() )
			{
				if( attribute.name() === name )
					return attribute;
			}
			else if( !result )
				result = attribute;
		}
		return result;
	},

	_selectChildByName = function( node, name ) {
		// Look for the first child having the right name
		var child = node.firstChild;
		while( child ) {
			if( 1 === child.nodeType && name === child.localName )
				return child;
			child = child.nextSibling;
		}
		return null;
	},

	_xml = function( obj, xmlDocument, parentNode, name ) {
		// When no 'document', create one
		if( !xmlDocument ) {
			xmlDocument = document.createElement( "gpf_xml" );
			parentNode = xmlDocument;
		}
		var
			xmlAttributes = (new gpf.AttributesMap( obj )).filter( gpf.XmlAttribute ),
			attributes,
			node,
			member,
			value,
			type,
			selectedAttribute,
			idx,
			subValue;
		// If no 'name', check the Class attribute
		if( !name )
		{
			attributes = xmlAttributes.member( "Class" );
			selectedAttribute = attributes.has( gpf.XmlElementAttribute );
			if( selectedAttribute )
				name = selectedAttribute.name();
			else
				name = "object";
		}
		// Create new node
		node = parentNode.appendChild( document.createElement( name ) );
		// If not an object, serialize the textual representation
		if( "object" !== typeof obj )
			node.innerHTML = gpf.escapeFor( "" + obj.valueOf(), "xml" );
		// Otherwise, process each member individually
		else for( member in obj ) {
			value = obj[ member ];
			// Exception for dates
			if( value instanceof Date )
				value = gpf.dateToComparableFormat( value,  true );
			type = typeof value;
			// Skip functions
			if( "function" === type ) continue;
			// Check member's attributes 
			attributes = xmlAttributes.member( member );
			// Ignore?
			if( attributes.has( gpf.XmlIgnoreAttribute ) )
				continue;
			// Default name
			if( "_" == member.charAt( 0 ) )
				member = member.substr( 1 );
			// Check if list
			selectedAttribute = attributes.has( gpf.XmlListAttribute );
			if( value instanceof Array || selectedAttribute ) {
				// TODO: what to do when value is empty?
				if( selectedAttribute && selectedAttribute.name() )
					parentNode = node.appendChild( document.createElement( selectedAttribute.name() ) );
				else
					parentNode = node;
				// Get the list of 'candidates'
				attributes = attributes.filter( gpf.XmlElementAttribute );
				for( idx in value )
				{
					subValue = value[ idx ];
					// Select the right candidate
					type = _selectByType( attributes, subValue );
					if( type && type.name() )
						name = type.name();
					else
						name = "item";
					_xml( subValue, xmlDocument, parentNode, name );
				}
				continue; // Next
			}
			// Check if element
			selectedAttribute = attributes.has( gpf.XmlElementAttribute );
			if( "object" === type || selectedAttribute )
			{
				// Element
				if( selectedAttribute && selectedAttribute.name() )
						member = selectedAttribute.name();
				_xml( value, xmlDocument, node, member )
			}
			else
			{
				// Attribute
				selectedAttribute = attributes.has( gpf.XmlAttributeAttribute );
				if( selectedAttribute && selectedAttribute.name() )
						member = selectedAttribute.name();
				node.setAttribute( member, value.toString() );
			}
		}
		return node;
	},

	_parseXml = function( node, objClass ) {
		var
			obj,
			xmlAttributes,
			attributes,
			member,
			name,
			value,
			type,
			selectedAttribute,
			child;
		// Date object 
		if( objClass === Date )
			return gpf.dateFromComparableFormat( node.innerHTML );
		// Instanciate a new object
		obj = new objClass();
		xmlAttributes = (new gpf.AttributesMap( obj )).filter( gpf.XmlAttribute );
		// Analysis is based on object members, not the XML
		for( member in obj ) {
			value = obj[ member ];
			type = typeof value;
			// Skip functions
			if( "function" === type )
				continue;
			else {
				// Check member's attributes 
				attributes = xmlAttributes.member( member );
				// XmlIgnore?
				if( attributes.has( gpf.XmlIgnoreAttribute ) )
					continue;
				// Default name
				if( "_" === member.charAt( 0 ) )
					name = member.substr( 1 );
				else
					name = member;
				// Check if list
				selectedAttribute = attributes.has( gpf.XmlListAttribute );
				if( value instanceof Array || selectedAttribute ) {
					// Root node for the list
					if( selectedAttribute && selectedAttribute.name() )
						child = _selectChildByName( node, selectedAttribute.name() );
					else
						child = node;
					if( null === child )
						continue;
					value = [];
					// Enumerate children and check if any correspond to a specific XmlElement
					child = child.firstChild;
					while( child ) {
						if( 1 === child.nodeType ) { // Element
							selectedAttribute = _selectByName( attributes, child.localName );
							if( selectedAttribute ) {
								if( selectedAttribute.objClass() )
									value.push( _parseXml( child, selectedAttribute.objClass() ) );
								else
									value.push( child.innerHTML );
							}
						}
						child= child.nextSibling;
					}
					obj[ member ] = value;
					continue;
				}
				// Check if element
				selectedAttribute = attributes.has( gpf.XmlElementAttribute );
				if( "object" === type || selectedAttribute ) {
					type = undefined;
					// Element
					if( selectedAttribute ) {
						if( selectedAttribute.name() )
							name = selectedAttribute.name();
						if( selectedAttribute.objClass() )
							type = selectedAttribute.objClass();
					}
					// Look for the first child having the right name
					child = _selectChildByName( node, name );
					if( child )
						obj[ member ] = _parseXml( child, type );
				} else {
					// Attribute
					selectedAttribute = attributes.has( gpf.XmlAttributeAttribute );
					if( selectedAttribute && selectedAttribute.name() )
						name = selectedAttribute.name();
					obj[ member ] = gpf.value( node.getAttribute( name ), value );
				}
			}
		}
		return obj;
	},

	_toXml = function() {
		return _xml( this ).parentNode;
	},

	_fromXml = function( xml ){
		return _parseXml( xml, this.constructor );
	}
;

gpf.XmlAttribute = gpf.Attribute.extend( {

	alterPrototype: function( objPrototype ) {
		/*
			If not yet defined creates two new XML members
			- toXml()
			- fromXml( xml )
		*/
		if( !objPrototype.toXml ) {
			objPrototype.toXml = _toXml;
			objPrototype.fromXml = _fromXml;
		}
	}

} );

gpf.extend( gpf, {

	XmlIgnoreAttribute: gpf.XmlAttribute.extend( {
	} ),

	XmlElementAttribute: gpf.XmlAttribute.extend( {

		"[_name]": [ gpf.$ClassProperty() ],
		_name: "",
		"[_objClass]": [ gpf.$ClassProperty() ],
		_objClass: null,

		init: function( name, objClass ) {
			this._name = name;
			if( objClass )
				this._objClass = objClass;
		}

	} ),

	XmlAttributeAttribute: gpf.XmlAttribute.extend( {

		"[_name]": [ gpf.$ClassProperty() ],
		_name: "",

		init: function( name ) {
			this._name = name;
		}

	} ),

	XmlListAttribute: gpf.XmlAttribute.extend( {

		"[_name]": [ gpf.$ClassProperty() ],
		_name: "",

		init: function( name ) {
			this._name = name;
		}

	} )

} );

gpf.Attribute.declare( gpf.XmlAttribute );

} )(); /* End of privacy scope */
