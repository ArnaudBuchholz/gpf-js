(function(){ /* Begin of privacy scope */

var
	_refDate = new Date( 1975, 3, 26, 12, 14, 26 ),
	_refDateL = "1975-04-26 12:14:26",
	_refDateS = "1975-04-26"
	

gpf.declareTests( {

	"dateToComparableFormat": [

		function( ctx ) {
			ctx.result = gpf.dateToComparableFormat( _refDate );
			return ctx.result === _refDateL;
		},

		function( ctx ) {
			ctx.result = gpf.dateToComparableFormat( _refDate, false );
			return ctx.result === _refDateS;
		}

	],

	"dateFromComparableFormat": [

		function( ctx ) {
			ctx.date = gpf.dateFromComparableFormat( _refDateL );
			ctx.result = gpf.dateToComparableFormat( ctx.date );
			return ctx.result === _refDateL;
		},

		function( ctx ) {
			ctx.date = gpf.dateFromComparableFormat( _refDateS );
			ctx.result = gpf.dateToComparableFormat( ctx.date, false );
			return ctx.result === _refDateS;
		}

	]

} );

} )(); /* End of privacy scope */
