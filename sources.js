(function(){ /* Begin of privacy scope */

var
	_sources = [
		  "base"					// Basic functions
		, "include"
		, "tokenizer"			// Javascript parser
		, "class"					// Class
		, "attributes"		// Attributes
		, "interface"			// Interface
//		, "i_enumerable"	// IEnumerable
		, "i_array"				// IArray
		, "error"					// Error base class
		, "att_class"			// Class attributes
		, "string"				// String functions
		, "date"					// Date functions
		, "att_xml"				// Xml attributes
	];

gpf.sources = function() {
	return _sources.join( "," );
};

})(); /* End of privacy scope */
