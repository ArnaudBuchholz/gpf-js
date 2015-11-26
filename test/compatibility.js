"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

// Because some of this functions have more than 3 parameters
/*jshint -W072*/
/*eslint-disable max-params*/

/*eslint-disable max-nested-callbacks, space-before-keywords*/

describe("compatibility", function () {

    var tests = {

            Array: {
                every: {
                    length: 1,
                    "should return true when it goes over all items": function (method) {
                        var array = [1, 2, 3, -6, 10],
                            sum = 0,
                            result;
                        result = method.apply(array, [function (value) {
                            sum += value;
                            return true;
                        }]);
                        assert(true === result);
                        assert(10 === sum);
                    },
                    "should return false when it stops on a given item": function (method) {
                        var array = [1, 2, 3, -6, 10],
                            sum = 0,
                            result;
                        result = method.apply(array, [function (value) {
                            if (value > 0) {
                                sum += value;
                                return true;
                            }
                            return false;
                        }]);
                        assert(false === result);
                        assert(6 === sum);
                    },
                    "should iterate with a bound context": function (method) {
                        var array = [1, 2, 3, -6, 10],
                            scope = {
                                sum: 0,
                                index: 0
                            },
                            result;
                        result = method.apply(array, [function (value, idx) {
                            var me = this; //eslint-disable-line no-invalid-this
                            assert(me === scope);
                            me.index = idx;
                            if (value > 0) {
                                me.sum += value;
                                return true;
                            }
                            return false;
                        }, scope]);
                        assert(false === result);
                        assert(6 === scope.sum);
                        assert(3 === scope.index);
                    }
                },
                filter: {
                    length: 1,
                    "should filter": function (method) {
                        var array = [1, 2, 3, 4, 5],
                            result;
                        result = method.apply(array, [function (value) {
                            return value % 2 === 0;
                        }]);
                        assert(result.length === 2);
                        assert(result[0] === 2);
                        assert(result[1] === 4);
                    },
                    "should filter with a bound context": function (method) {
                        var array = [1, 2, 3, 4, 5],
                            obj = {},
                            result;
                        result = method.apply(array, [function (value) {
                            assert(this === obj); //eslint-disable-line no-invalid-this
                            return value % 2 === 0;
                        }, obj]);
                        assert(result.length === 2);
                        assert(result[0] === 2);
                        assert(result[1] === 4);
                    }
                },
                forEach: {
                    length: 1,
                    "should iterate": function (method) {
                        var array = [1, 2, 3],
                            sum = 0;
                        assert("function" === typeof array.forEach);
                        assert(!array.hasOwnProperty("forEach"));
                        method.apply(array, [function (value) {
                            sum += value;
                        }]);
                        assert(6 === sum);
                    },
                    "should iterate with a bound context": function (method) {
                        var array = [1, 2, 3],
                            obj = {
                                sum: 0
                            };
                        method.apply(array, [function (value) {
                            this.sum += value; //eslint-disable-line no-invalid-this
                        }, obj]);
                        assert(6 === obj.sum);
                    }
                },
                indexOf: {
                    length: 1,
                    "should expose indexOf()": function (method) {
                        var obj = {},
                            array = [1, 2, 3, obj, "abc"];
                        assert(-1 === method.apply(array, [4]));
                        assert(0 === method.apply(array, [1]));
                        assert(3 === method.apply(array, [obj]));
                        assert(-1 === method.apply(array, [{}]));
                        assert(4 === method.apply(array, ["abc"]));
                    }
                },
                map: {
                    length: 1,
                    "should map with a bound context": function (method) {
                        var obj = {},
                            array = [1, 2, 3, obj, "abc"],
                            result;
                        assert("function" === typeof array.map);
                        assert(!array.hasOwnProperty("map"));
                        result = method.apply(array, [function (value, idx) {
                            assert(this === obj); //eslint-disable-line no-invalid-this
                            assert(value === array[idx]);
                            return idx;
                        }, obj]);
                        assert(result.length === array.length);
                        assert(result[0] === 0);
                        assert(result[4] === 4);
                    }
                },
                reduce: {
                    length: 1,
                    "should reduce with no initial value": function (method) {
                        var array = [0, 1, 2, 3, 4],
                            lastIndex = 1;
                        function reducer (previousValue, currentValue, index, processedArray) {
                            assert(array === processedArray);
                            assert(lastIndex === index);
                            ++lastIndex;
                            return previousValue + currentValue;
                        }
                        assert(10 === method.apply(array, [reducer]));
                    },
                    "should reduce with intial value": function (method) {
                        var array = [0, 1, 2, 3, 4],
                            lastIndex = 0;
                        function reducer (previousValue, currentValue, index, processedArray) {
                            assert(array === processedArray);
                            assert(lastIndex === index);
                            ++lastIndex;
                            return previousValue + currentValue;
                        }
                        assert(20 === method.apply(array, [reducer, 10]));
                    }
                }
            },

            Function: {
                bind: {
                    length: 1,
                    "should bind to a context": function (method) {
                        var scope = {
                                member: null
                            },
                            bound;
                        /**
                         * Will be bound
                         *
                         * @param value
                         * @this bound scope
                         */
                        function testFunction (value) {
                            /*jshint validthis:true*/
                            assert(this === scope);
                            this.member = value;
                        }
                        bound = method.apply(testFunction, [scope]);
                        // Check the scope when calling bound
                        bound(true);
                        assert(true === scope.member);
                        // Ignore applied scope when bound
                        bound.apply({}, [false]);
                        assert(false === scope.member);
                    }
                }
            },

            Object: {
                create: {
                    length: -1, // ignore
                    "allows creating objects with a given prototype": function (method) {
                        var object = method.apply(Object, [{
                            method: function () {
                                return "myMethod";
                            }
                        }]);
                        assert(!object.hasOwnProperty("method"));
                        assert("function" === typeof object.method);
                        assert(object.method() === "myMethod");
                    },
                    "is compatible with instanceof": function (method) {
                        function A () {
                        }
                        A.prototype = {
                            a: function () {
                                return "a";
                            }
                        };
                        var a = method.apply(Object, [A.prototype]);
                        assert(a.a() === "a");
                        assert(a instanceof A);
                    },
                    "allows inheritance and use of instanceof": function (method) {
                        function A () {
                        }
                        A.prototype = {
                            a: function () {
                                return "a";
                            }
                        };
                        function B () {
                        }
                        B.prototype = new A();
                        var b = method.apply(Object, [B.prototype]);
                        assert(b.a() === "a");
                        assert(b instanceof A);
                        assert(b instanceof B);
                    }
                },
                getPrototypeOf: {
                    length: 1,
                    "returns prototype passed to Object.create": function (method) {
                        var proto,
                            object;
                        proto = {
                            a: function () {
                                return "a";
                            }
                        };
                        object = Object.create(proto);
                        assert(method.apply(Object, [object]) === proto);
                    },
                    "returns prototype from constructor": function (method) {
                        function A () {
                        }
                        A.prototype = {
                            constructor: A, // required for cscript
                            a: function () {
                                return "a";
                            }
                        };
                        var a = new A();
                        assert(method.apply(Object, [a]) === A.prototype);
                    }
                }
            },

            String: {
                trim: {
                    length: 0,
                    "should trim left and right": function (method) {
                        var string = " \t  abc\t \t";
                        assert("abc" === method.apply(string, []));
                    }
                }
            }

        },
        samples = {
            Array: [],
            Function: function () {},
            Object: Object,
            String: ""
        };

    function shouldExpose (object, methodName, arity) {
        if (Object === object) {
            it("should expose the method " + methodName, function () {
                assert("function" === typeof object[methodName]);
                if (-1 !== arity) {
                    assert(object[methodName].length === arity);
                }
            });
        } else {
            it("should expose a method " + methodName + " through prototype", function () {
                assert("function" === typeof object[methodName]);
                assert(!object.hasOwnProperty(methodName));
                if (-1 !== arity) {
                    assert(object[methodName].length === arity);
                }
            });
        }
    }

    function addTest (type, methodName, label) {
        var sample = samples[type],
            testMethod = tests[type][methodName][label],
            method = sample[methodName],
            compatibleMethod;
        if ("function" !== typeof testMethod) {
            return;
        }
        it(label, function () {
            testMethod(method);
        });
        if (gpf.internals) {
            compatibleMethod = gpf.internals._gpfCompatibility[type][methodName];
            if (compatibleMethod !== method) {
                it(label + " (compatible)", function () {
                    testMethod(compatibleMethod);
                });
            }
        }
    }

    function describeMethod (type, methodName, methodTests) {
        return function () {
            var label;
            shouldExpose(samples[type], methodName, methodTests.length);
            for (label in methodTests) {
                if (methodTests.hasOwnProperty(label)) {
                    addTest(type, methodName, label);
                }
            }
        };
    }

    function declare (type) {
        var typedTests = tests[type],
            methodName;
        for (methodName in typedTests) {
            if (typedTests.hasOwnProperty(methodName)) {
                describe(methodName, describeMethod(type, methodName, typedTests[methodName]));
            }
        }
    }

    describe("Array", function () {

        describe("default support", function () {

            it("should allow building an array with a given size", function () {
                var array = new Array(5),
                    idx;
                assert(5 === array.length);
                for (idx = 0; idx < 5; ++idx) {
                    assert(undefined === array[idx]);
                }
                assert("    " === array.join(" "));
            });

            it("provides standard slice", function () {
                var fruits = ["Banana", "Orange", "Lemon", "Apple", "Mango"],
                    citrus = fruits.slice(1, 3);
                assert(2 === citrus.length);
                assert(citrus[0] === "Orange");
                assert(citrus[1] === "Lemon");
            });

        });

        declare("Array");

        if (gpf.internals) {

            describe("(internal) _gpfArraySlice", function () {

                var _gpfArraySlice = gpf.internals._gpfArraySlice;

                it("transforms an arra-like into an array", function () {
                    var object = {};
                    function test () {
                        var array = _gpfArraySlice(arguments);
                        assert(array instanceof Array);
                        assert(4 === array.length);
                        assert(0 === array[0]);
                        assert("1" === array[1]);
                        assert(true === array[2]);
                        assert(object === array[3]);
                    }
                    test(0, "1", true, object);
                });

                it("slices an array", function () {
                    var result = _gpfArraySlice([0, 1, 2], 1, 2);
                    assert(1 === result.length);
                    assert(1 === result[0]);
                });

                it("supports optional parameters (none)", function () {
                    var result = _gpfArraySlice([0, 1, 2]);
                    assert(3 === result.length);
                    assert(0 === result[0]);
                    assert(1 === result[1]);
                    assert(2 === result[2]);
                });

                it("supports optional parameters (no to)", function () {
                    var result = _gpfArraySlice([0, 1, 2], 1);
                    assert(2 === result.length);
                    assert(1 === result[0]);
                    assert(2 === result[1]);
                });

            });
        }

    });

    describe("Function", function () {

        describe("default support", function () {

            it("allows creating function with parameters", function () {
                /*jshint -W064*/
                /*jshint -W061*/
                var thisName = Function("value", "return value;"); //eslint-disable-line no-new-func
                /*jshint +W061*/
                /*jshint +W064*/
                assert("function" === typeof thisName);
                assert(1 === thisName.length);
                assert(123 === thisName(123));
            });

            it("should detect undefined parameter", function () {
                function testFunction (expected) {
                    assert(arguments.length === expected);
                }
                testFunction(1);
                testFunction(2, "abc");
                testFunction(2, undefined);
                testFunction(3, undefined, undefined);
            });

        });

        describe("name support", function () {

            it("exposes a name", function () {
                function thisName () {}
                assert(thisName.compatibleName() === "thisName");
            });

            it("supports empty name", function () {
                var thisName = function () {}; //eslint-disable-line func-style
                assert(thisName.compatibleName() === "");
            });

            if (gpf.internals && Function.prototype.compatibleName !== gpf.internals._gpfGetFunctionName) {

                var _gpfGetFunctionName = gpf.internals._gpfGetFunctionName;

                it("exposes a name (compatible)", function () {
                    function thisName () {}
                    assert(_gpfGetFunctionName.call(thisName) === "thisName");
                });

                it("supports empty name", function () {
                    var thisName = function () {}; //eslint-disable-line func-style
                    assert(_gpfGetFunctionName.call(thisName) === "");
                });

            }

        });

        declare("Function");

    });

    describe("Object", function () {

        declare("Object");

    });

    describe("String", function () {

        declare("String");

    });

});
