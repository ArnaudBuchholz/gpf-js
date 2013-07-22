(function(){ /* Begin of privacy scope */

var
	A = gpf.Class.extend( {

		"[_a]": [ gpf.$ClassProperty( false ) ],
		_a: 0,

		"[_aLittleBitMoreThanB]": [ gpf.$ClassProperty( true, "b" ) ],
		_aLittleBitMoreThanB: 0,

		init: function() {
			this._a = 0;
			this._aLittleBitMoreThanB = 1;
		},

	} );

gpf.declareTests( {

	"basic": [

		function( ctx ) {
			/* Tests $ClassProperty */
			var a = new A();
			ctx.step = 0; // Verify the member a
			ctx.result = a.a();
			if( ctx.result !== 0 )
				return false; 
			ctx.step = 1; // Verify the member b
			ctx.result = a.b();
			if( ctx.result !== 1 )
				return false;
			ctx.step = 2; // That is not read-only
			a.b( 2 );
			ctx.result = a.b();
			if( ctx.result !== 2 )
				return false;
			return true;
		}

	],

	"error": [

		function( ctx ) {
			/* Tests access to read only member */
			var a = new A();
			ctx.caught = false;
			try {
				a.a( 2 ); // Should be read only 
			}
			catch(e)
			{
				ctx.caught = true;
			}
			ctx.result = a.a();
			return ( ctx.caught && ctx.result === 0 );
		},

		function( ctx ) {
			/* Tests invalid declaration (related to attributes.js) */
			ctx.caught = false;
			try {
				var C = A.extend( {
	
					"[_c]":  [ gpf.$ClassProperty( true ) ] // should fail
	
				} );
			}
			catch(e)
			{
				ctx.name = e.name();
				ctx.message = e.message();
				ctx.member = e.member();
				ctx.caught = e instanceof gpf.ClassAttributeError
					&& ctx.name === "ClassAttributeError"
					&& ctx.member === "_c";
			}
			return ctx.caught;
		}

	]

} );

} )(); /* End of privacy scope */
