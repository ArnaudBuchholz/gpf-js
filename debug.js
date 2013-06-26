(function(){ /* Begin of privacy scope */

// Defines gpf namespace
this[ "gpf" ] = {};

// DEBUG specifics
gpf.ASSERT = function( condition, message ) {
	if( !condition ) {
		alert( "ASSERTION FAILED: " + message );
		throw { message: "ASSERTION FAILED: " + message };
	}
};

// Loaded handler
var _loaded = false;
gpf.loaded = function() {
	return _loaded;
};

// Source loading (considering gpf.include exists)
var
	_sources = 0,
	_source_idx = 0;
function loadSources()
{
	if( _source_idx < _sources.length )
	{
		if( _sources[ _source_idx ] == "include" ) ++_source_idx;
		gpf.include( _sources[ _source_idx++ ] + ".js" ).onload = loadSources;
	}
	else
		_loaded = true;
}

// Ugly but fast way to insert sources
var head = document.getElementsByTagName("head")[0] || document.documentElement;
function _debugInclude( src ) {
	var script = document.createElement("script");
	script.src = src;
	script.language = "javascript";
	head.insertBefore( script, head.firstChild );
}
_debugInclude( "include.js" );
_debugInclude( "sources.js" );

function waitForBootstrap() {

	if( undefined === gpf.sources || undefined === gpf.include ) {
		window.setTimeout( waitForBootstrap, 100 );
		return;
	}
	// Now that include & sources are loaded, load the missing sources
	_sources = gpf.sources().split( "," );
	loadSources();
}
waitForBootstrap();

})(); /* End of privacy scope */
