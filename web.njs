var
	http = require("http"),
	url = require("url"),
	path = require("path"),
	fs = require("fs"),

	// These are the options that can be modified through web/options.txt
	options = {
		test_web: 1,
		trace: 1,
		delay: 0
	},

	port = process.argv[2] || 8888
;

function truncate( path ) {
	if( path.length > 76 )
		return "..." + path.substr( path.length - 73 );
	else
		return path;
}

function answer( response, filename, statusCode, data ) {
	if( options.trace )
		console.log( statusCode + " " + truncate( filename ) );
	if( 200 !== statusCode ) {
		response.writeHead( statusCode, {"Content-Type": "text/plain"} );
		if( 404 === statusCode )
			response.write( "404 Not Found\n" );
		else
			response.write( data );
	} else {
		response.writeHead( statusCode );
		response.write( data, "binary" );
	}
	response.end();
}

http.createServer( function( request, response ) {

	var
		parsedUrl = url.parse( request.url ),
		uri = parsedUrl.pathname,
		query = new String( parsedUrl.query ),
		filename = path.join( process.cwd(), uri );

	if( options.trace ) {
		console.log( "GET " + request.url );
		console.log( "PTH " + truncate( filename ) );
	}

	// 404?
	if( !fs.existsSync( filename ) )
		return answer( response, filename, 404 );

	// Folder browsing
	if( fs.statSync( filename ).isDirectory() )
		filename += '/index.html';

	// Special cases
	var data = "";
	if( options.test_web ) {

		if( 0 === uri.indexOf( "/web/options.txt" ) ) {

			query = query.split( "&" );
			if( "read" === query[0] ) {

				if( options.trace ) console.log( "Getting options" );
				data = [];
				for( var member in options )
					data.push( member + "=" + options[ member ] );
				data = data.join( "\n" );

			} else if( "write" === query[0] ) {

				if( options.trace ) console.log( "Writing options" );
				for( var idx in query ) {
					if( 0 == idx ) continue;
					var
						optionPair = query[ idx ].split( "=" ),
						name = optionPair[ 0 ],
						value = optionPair[ 1 ];
					var valueType = typeof options[ name ];
					if( "number" === valueType )
						value = parseInt( value, 10 );
					if( options.trace ) console.log( "\t" + name + "=" + value );
					options[ name ] = value;
				}
				data = "OK";
			}

		}

	}
	if( data.length )
		return answer( response, filename, 200, data );

	// Read and return file
	fs.readFile( filename, "binary", function( err, data ) {
		if( err )
			return answer( response, filename, 500, err + "\n" );

		if( options.delay )
			setTimeout( function(){ answer( response, filename, 200, data ); }, 100 + Math.floor( 400 * Math.random() ) );
		else
			answer( response, filename, 200, data );
	} );

} ).listen( parseInt( port, 10 ) );

console.log( "Welcome to the GPF test environment\n => http://localhost:" + port + "/\nCTRL + C to shutdown" );
