function waitForLoad() {

	if( "undefined" === typeof gpf || !gpf.loaded() ) {
		window.setTimeout( waitForLoad, 100 );
		return;
	}
	if( document.readyState && document.readyState !== "complete" ) {
		window.setTimeout( waitForLoad, 100 );
		return;
	}
	console.log( "Applying blog changes..." );
	var codes = document.getElementsByTagName( "code" );
	for( var idx = 0; idx < codes.length; ++idx )
		reformatCode( codes[ idx ] );
}
window.setTimeout( waitForLoad, 0 );

function onTokenFound( type, token, context ) {

	// Trim any space token before the first non space one
	if( "space" == type && !this.hasChildNodes() )
		return;
	var tag = document.createElement( "span" );
	tag.className = type;
	tag.appendChild( document.createTextNode( token ) );
	this.appendChild( tag );

}

function reformatCode( codeElement ) {

	var codeClass = codeElement.className;
	if( "javascript" === codeClass ) {

		var pre = document.createElement( "pre" );
		pre.className = "code";
		pre = codeElement.parentNode.insertBefore( pre, codeElement );
		pre.appendChild( codeElement );
		var src = codeElement.innerHTML;
		codeElement.innerHTML = ""; // Easy way to clear this
		gpf.tokenize.apply( codeElement, [ src, onTokenFound ] );

	}
}