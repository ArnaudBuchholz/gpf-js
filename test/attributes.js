(function(){ /* Begin of privacy scope */

var
	TestAttribute = gpf.Attribute.extend( { } ),
	Test1ValueAttribute = TestAttribute.extend( { } ),
	$Test1Value = function(){ return new Test1ValueAttribute(); },
	Test2ValueAttribute = TestAttribute.extend( { } ),
	$Test2Value = function(){ return new Test2ValueAttribute(); },

	A = gpf.Class.extend( {

		"[_a]": [ $Test1Value() ],
		_a: 0,

		"[_c]": [ $Test1Value() ],
		_c: 0,

		init: function( value ) {
			this._a = value;
		},

		a: function() {
			return this._a;
		}

	} ),

	B = A.extend( {

		"[_b]": [ $Test2Value() ],
		_b: 0,

		"[_c]": [ $Test2Value() ],
		_c: 0,

		init: function( value ) {
			this._super( value - 1 );
			this._b = value;
		},

		b: function() {
			return this._b;
		}
		
	} )
;

gpf.declareTests( {

	"basic": [

		function( ctx ) {
			/* Tests declaration & inheritence */
			/* Check the existence of attributes on class A */
			var a = new A();
			var attributesA = new gpf.AttributesMap( a );
			ctx.step = 0;
			ctx.result = attributesA.count();
			if( 2 !== ctx.result )
				return false;
			/* Check the existence of attributes on member A::_c */
			ctx.step = 1;
			ctx.result = attributesA.member( "_c" ).length();
			if( 1 !== ctx.result )
				return false;
			/* Check the existence of attributes on class B */
			var b = new B();
			var attributesB = new gpf.AttributesMap( b );
			ctx.step = 2;
			ctx.result = attributesB.count();
			if( 4 !== ctx.result )
				return false;
			/* Check the existence of attributes on member B::_c */
			ctx.step = 3;
			ctx.result = attributesB.member( "_c" ).length();
			if( 2 !== ctx.result )
				return false;
			return true;
		},

		function( ctx ) {
			/* Tests AttributeList member*/
			/* Check the existence of attributes on class B */
			var b = new B();
			var attributesB = new gpf.AttributesMap( b );
			var attributesBTest2Value = attributesB.filter( Test2ValueAttribute );
			ctx.result = attributesBTest2Value.count();
			if( 2 !== ctx.result )
				return false;
			/* Check the existence of Test2Value attributes on member B::_c */
			ctx.result = attributesBTest2Value.member( "_c" ).length();
			if( 1 !== ctx.result )
				return false;
			return true;
		}

	]

} );



} )(); /* End of privacy scope */
