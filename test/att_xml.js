(function(){ /* Begin of privacy scope */

var
	Movie = gpf.Class.extend( {

		"[Class]": [ gpf.$XmlElement( "Movie" ) ],

		// By default, privates are serialized without _ as attributes
		_title: "",
		_rating: 0.0,

		// The XMLAttribute allows to set the name of the attribute
		"[_imdbTitle]": [ gpf.$XmlAttribute( "imdb-title" ) ],
		_imdbTitle: "",

		// The XmlElement allows to serialize the value as an element, using a specific name and/or type
		"[_releaseDate]": [ gpf.$XmlElement( "release", Date ) ],
		_releaseDate: null,

		/*
			XmlList indicates that the member will contain several values
			An array member also indicates the same thing
			The list may be introduced with a specific tag (here script-writers)
				Each object in the array is saved as an element
		*/
		"[_scriptwriters]": [ gpf.$XmlList( "script-writers" ), gpf.$XmlElement( "name" ) ],
		_scriptwriters: [],

		// Functions are ignored
		// init *must* not have any arguments
		init: function() {
		}

	} ),

	starshipTroopers = gpf.extend( new Movie(), {
		_title: "Starship Troopers",
		_releaseDate: new Date( 1997, 6, 11 ),
		_rating: 6.9,
		_imdbTitle: "tt0120201",
		_scriptwriters: [ "Edward Neumeier", "Robert A. Heinlein" ]
	} ),

	starshipTroopersXML = "<movie imdb-title=\"tt0120201\" rating=\"6.9\" title=\"Starship Troopers\"><release>1997-07-11 00:00:00</release><script-writers><name>Edward Neumeier</name><name>Robert A. Heinlein</name></script-writers></movie>";
;

gpf.declareTests( {

	"toXml": [

		function( ctx ) {
			// toXML string
			ctx.result = starshipTroopers.toXml().innerHTML;
			return starshipTroopersXML === ctx.result;
		}

	],

	"fromXml": [

		function( ctx ) {
			// From XML string
			xmlDocument = document.createElement( "gpf_xml" );
			xmlDocument.innerHTML = starshipTroopersXML;
			var movie = Movie.prototype.fromXml( xmlDocument );
			ctx.result = starshipTroopers.toXml().innerHTML;
			return starshipTroopersXML === ctx.result;
		}

	]

} );

} )(); /* End of privacy scope */
