var
	  URL_RELEASE	= "http://buchholz.free.fr/gpf-js/release.js"
	, URL_BLOGJS	= "http://buchholz.free.fr/gpf-js/blog/blog.js"
	, URL_BLOGCSS	= "http://buchholz.free.fr/gpf-js/blog/blog.css"
;
function doInclude() {

	var
		head = document.getElementsByTagName("head")[0] || document.documentElement,
		scripts = head.getElementsByTagName( "script" ),
		script, link;
	for( var idx = 0; idx < scripts.length; ++idx ) {
		script = scripts[ idx ];
		if( script.src === URL_RELEASE )
			return; // OK, script already inserted
	}
	// Not inserted yet
	script = document.createElement( "script" );
	script.language = "javascript";
	script.src = URL_RELEASE;
	head.insertBefore( script, head.firstChild );
	script = document.createElement( "script" );
	script.language = "javascript";
	script.src = URL_BLOGJS;
	head.insertBefore( script, head.firstChild );
	link = document.createElement( "link" );
	link.setAttribute( "rel", "stylesheet" );
	link.setAttribute( "type", "text/css" );
	link.setAttribute( "href", URL_BLOGCSS );
	head.appendChild( link ); // Must be the last one
}
window.setTimeout( doInclude, 0 ); 
