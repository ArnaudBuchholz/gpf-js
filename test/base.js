(function(){ /* Begin of privacy scope */

var
	string = "Hello World!",
	array =  [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ],
	object = {
		"number": 1,
		"string": string,
		"null": null,
		"object": { member: "value" },
		"function": function(){ return string; }
	},
	object_members = "number,string,null,object,function",
	object_members_no_null = "number,string,object,function";

gpf.declareTests( {

	"each": [

		function( ctx ) {
			/* Check input & output (simple) */
			ctx.result = 0;
			gpf.each( array, function( idx, value ) {
					ctx.result += value;
				} );
			return ctx.result === 45;
		},

		function( ctx ) {
			/* Check input & output (advanced) */
			ctx.result = gpf.each.apply( object, [ array, function( idx, value ) {
				if( idx == "7" && value == 7 && this == object ) return true; 
			}, string ] );
			return ctx.result === true;
		},

		function( ctx ) {
			/* check object enumeration and null pointer */
			ctx.members = [];
			ctx.result = gpf.each( object, function( name, value ) {
				if( typeof name == "string" ) ctx.members.push( name );
				if( name == "null" && value != null ) return false;
			}, true );
			ctx.members = ctx.members.join(",");
			return ctx.result && ctx.members == object_members;
		},
	],

	"extend": [

		 function( ctx ) {
			/* Extend an object and verify it works */
			ctx.result = {
				"number": 0,
				"string": 0,
				"object": 0,
				"function": 0
			};
			ctx.members = [];
			ctx.step = 0; // Extend and overwrite
			if( ctx.result != gpf.extend( ctx.result, object ) ) return false;
			ctx.step = 1; // Check overriden members
			gpf.each( object, function( name, value ){
				if( value == ctx.result[ name ] )
					ctx.members.push( name );
			} );
			ctx.members = ctx.members.join(",");
			return ctx.members == object_members;
		},

		function( ctx ) {
			/* Extend an object and check how overwrite is called */
			ctx.result = {
				"number": 0,
				"string": 0,
				"object": 0,
				"function": 0
			};
			ctx.members = [];
			gpf.extend( ctx.result, object, function( obj, member, newvalue ){
				ctx.members.push( member );
			} );
			ctx.members = ctx.members.join(",");
			return ctx.members == object_members_no_null;
		},

		function( ctx ) {
			/* Extend an object and use overwrite to force non null values */
			ctx.result = {
				"number": 0,
				"string": 0,
				"null": 5,
				"object": 0,
				"function": 0
			};
			ctx.members = [];
			gpf.extend( ctx.result, object, function( obj, member, newvalue ){
				if( 0 === obj[ member ] )
				{
					obj[ member ] = newvalue;
					ctx.members.push( member );
				}
			} );
			ctx.members = ctx.members.join(",");
			return ctx.members == object_members_no_null;
		}

	],

	value: [

		function( ctx ) {
			/* Check most common conversions */
			ctx.step = 0;
			function testValue( expectedResult, value, defaultValue, expectedType )
			{
				++ctx.step;
				ctx.result = gpf.value( value, defaultValue, expectedType );
				return expectedResult !== ctx.result;
			}
			if( testValue( 0, 0, 1 ) ) return false;
			if( testValue( 0, "0", 1 ) ) return false;
			if( testValue( false, "0", true ) ) return false;
			if( testValue( true, "yes", false ) ) return false;
			if( testValue( "empty", undefined, "empty" ) ) return false;
			if( testValue( 1.2, "1.2", 1.1 ) ) return false;
			if( testValue( 1.2, "1.2", 1, "number" ) ) return false;
			return true;
		}

	],

	equal: [

		function( ctx ) {
			/* Simple comparisons */
			ctx.step = 0;
			if( !gpf.equal( 1, 1 ) ) return false;
			ctx.step = 1;
			if( !gpf.equal( "abc", "abc" ) ) return false;
			ctx.step = 2;
			if( gpf.equal( "abc", "abcd" ) ) return false;
			ctx.step = 3;
			if( !gpf.equal( object, object ) ) return false;
			ctx.step = 4;
			if( !gpf.equal( object, gpf.extend( {}, object ) ) ) return false;
			ctx.step = 5;
			if( !gpf.equal( document.body, document.body ) ) return false;
			return true;
		},

		function( ctx ) {
			/* More complex comparison */
			var equal_1_div1 = document.getElementById( "equal_1_div1" );
			var equal_1_div2;
			if( !equal_1_div1 ) {
				var placeholder = document.getElementById( "placeholder" );
				equal_1_div1 = placeholder.appendChild( document.createElement( "div" ) );
				equal_1_div1.id = "equal_1_div1";
				equal_1_div1.innerHTML = "<span>Hello World</span>";
				equal_1_div2 = equal_1_div1.cloneNode( true );
				equal_1_div2.id = "equal_1_div2";
				equal_1_div2 = placeholder.appendChild( equal_1_div2 );
			}
			else
				equal_1_div2 = document.getElementById( "equal_1_div1" );
			if( gpf.equal( equal_1_div1, equal_1_div2 ) ) return false;
			return true;
		}

	],

	baseANY: [

		function( ctx ) {
			/* Encoding part: base 16 and 64 */
			ctx.step = 0;
			ctx.value = gpf.toHexa( 2882400152 );
			if( ctx.value !== "ABCDEF98" ) return false;
			ctx.step = 1;
			ctx.value = gpf.toHexa( 2882400152, 4 );
			if( ctx.value !== "ABCDEF98" ) return false;
			ctx.step = 2;
			ctx.value = gpf.toHexa( 2882400152, 10 );
			if( ctx.value !== "00ABCDEF98" ) return false;
			ctx.step = 3;
			ctx.value = gpf.toBase64( 2882400152 );
			if( ctx.value !== "Crze+Y" ) return false;
			ctx.step = 4;
			ctx.value = gpf.toBase64( 2882400152, 8, "=" );
			if( ctx.value !== "==Crze+Y" ) return false;
			return true;
		},	

		function( ctx ) {
			/* Decoding part: base 16 and 64 */
			ctx.step = 0;
			ctx.value = gpf.fromHexa( "ABCDEF98", "0" );
			if( ctx.value !== 2882400152 ) return false;
			ctx.step = 1;
			ctx.value = gpf.fromHexa( "00ABCDEF98" );
			if( ctx.value !== 2882400152 ) return false;
			ctx.step = 2;
			ctx.value = gpf.fromBase64( "Crze+Y" );
			if( ctx.value !== 2882400152 ) return false;
			ctx.step = 3;
			ctx.value = gpf.fromBase64( "Crze+Y", "=" );
			if( ctx.value !== 2882400152 ) return false;
			return true;
		}

	],

	test: [

		function() {
			/* Array */
			return gpf.test( array, 2 ) === "2"
					&& gpf.test( array, 11 ) === undefined;
		},

		function() {
			/*  Object (using comparable values) */
			return gpf.test( object, null ) === "null"
				&& gpf.test( object, 1 ) === "number"
				&& gpf.test( object, "number" ) === undefined;
		}

	],

	set: [

		function( ctx ) {
			/* Array */
			ctx.array2 = array.concat([]); 
			ctx.result = gpf.set( ctx.array2, 11 );
			return gpf.set( ctx.array2, 2 ) === ctx.array2
					&& -1 < gpf.test( ctx.result, 11 )
					&& ctx.result === ctx.array2;
		}

	],

	clear: [

		function( ctx ) {
			/* Array */
			ctx.result = array.concat([]);
			return gpf.clear( ctx.result, 11 ).length === 10 // Nothing should be deleted
					&& gpf.clear( ctx.result, 2 ) === ctx.result
					&& ctx.result.join("") == "013456789";
		}

	]

} );

} )(); /* End of privacy scope */
