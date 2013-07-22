// Inspired from http://stackoverflow.com/questions/4845762/onload-handler-for-script-tag-in-internet-explorer
gpf.include = function( src ) {
	/*
		Loads dynamically any script
		Waits for the script to be loaded and calls a callback when done

		The following is an easy way to handle callbacks whenever the process is
		asychronous (window.setTimeout, onload callback). The function returns an
		object that can be overriden with our own loaded handler (if needed)
	*/
	var result = { onload: 0 };
	var head = document.getElementsByTagName("head")[0] || document.documentElement;
	var script = document.createElement("script");
	script.language = "javascript";
	script.src = src;

	var done = false;

	function detach() {
		// Handle memory leak in IE
		script.onerror = script.onload = script.onreadystatechange = null;
		if ( head && script.parentNode ) {
			head.removeChild( script );
		}
	}

	// Attach handlers for all browsers
	script.onload = script.onreadystatechange = function() {
		if( !done
		    && ( !this.readyState|| this.readyState === "loaded"
		         || this.readyState === "complete" ) ) {
			done = true;
			if( "function" === typeof result.onload )
				result.onload( src );
			detach();
		}
	};

	// TODO: verify browsers compatibility
	script.onerror = function() {
		console.log( "gpf.include( \"" + src + "\" ): an error occured" );
		if ( !done ) {
			done = true;
			if( "function" === typeof result.onerror )
				result.onerror( src );
			detach();
		}
	};

	// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
	// This arises when a base node is used (#2709 and #4378).
	// Found a bug in IE10 that loads & triggers immediatly script, use timeout
	window.setTimeout( function(){
			head.insertBefore( script, head.firstChild );
		}, 0 );

	return result;
};
