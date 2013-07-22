(function(){ /* Begin of privacy scope */

var
	A = gpf.Class.extend( {

		_a: 0,

		init: function( value ) {
			this._a = value;
		},

		a: function() {
			return this._a;
		}

	} ),

	B = A.extend( {

		_b: 0,

		init: function( value ) {
			this._b = value;
			this._super( value + 1 );
		},

		b: function() {
			return this._a + this._b;
		}

	} )
;

gpf.declareTests( {

	"basic": [

		function( ctx ) {
			/* Check usual test cases */
			ctx.step = 0; // Instance one A
			var a = new A(1);
			ctx.result = a.a();
			if( 1 !== ctx.result )
				return false;
			ctx.step = 1;  // Instance one B
			var b = new B(1);
			ctx.result = b.a();
			if( 2 !== ctx.result )
				return false;
			ctx.step = 3;  // Check that B has access to A members
			ctx.result = b.b();
			if( 3 !== ctx.result )
				return false;
			ctx.step = 4; // Check that b is instanceof A
			ctx.result = b instanceof A;
			if( !ctx.result )
				return false;
			ctx.step = 5; // Check that b has baseClass A
			ctx.result = b.baseClass === A;
			if( !ctx.result )
				return false;
			return true;
		}

	]
	
} );

} )(); /* End of privacy scope */
