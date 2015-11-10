"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

// Because some of this functions have more than 3 parameters
/*jshint -W072*/
/*eslint-disable max-params*/

/*eslint-disable max-nested-callbacks*/

describe("compatibility", function () {

    var tests = {

            Array: {
                every: {
                    length: 1,
                    "should return true when it goes over all items": function (method) {
                        var array = [1, 2, 3, -6, 10],
                            sum = 0,
                            result;
                        result = method.apply(array, [function (value) { //eslint-disable-line space-before-keywords
                            sum += value;
                            return true;
                        }]);
                        assert(true === result);
                        assert(10 === sum);
                    }
                }
            }

        },
        samples = {
            Array: []
        };

    function shouldExpose (object, methodName, arity) {
        it("should expose " + methodName, function () {
            assert("function" === typeof object[methodName]);
            assert(!object.hasOwnProperty(methodName));
            assert(object[methodName].length === arity);
        });
    }

    function addTest (type, methodName, label) {
        var sample = samples[type],
            testMethod = tests[type][methodName][label],
            method = sample[methodName],
            compatibleMethod;
        it(label, function () {
            testMethod(method);
        });
        if (gpf.internals) {
            compatibleMethod = gpf.internals._gpfCompatibility[type][method];
            if (compatibleMethod !== method) {
                it(label + " (compatible)", function () {
                    testMethod(compatibleMethod);
                });
            }
        }
    }

    function describeMethod (type, methodName, methodTests) {
        var label;
        shouldExpose(samples[type], methodName, methodTests.length);
        for (label in methodTests) {
            if (methodTests.hasOwnProperty(label)) {
                addTest(type, methodName, label);
            }
        }
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

        describe("basic support", function () {

            it("should allow building an array with a given size", function () {
                var array = new Array(5),
                    idx;
                assert(5 === array.length);
                for (idx = 0; idx < 5; ++idx) {
                    assert(undefined === array[idx]);
                }
                assert("    " === array.join(" "));
            });

        });

        declare("Array");

        describe("every", function () {

            it("should return false when it stops on a given item", function () {
                var array = [1, 2, 3, -6, 10],
                    sum = 0,
                    result;
                result = array.every(function (value) {
                    if (value > 0) {
                        sum += value;
                        return true;
                    }
                    return false;
                });
                assert(false === result);
                assert(6 === sum);
            });

            it("should expose every(callback, thisArg)", function () {
                var array = [1, 2, 3, -6, 10],
                    scope = {
                        sum: 0,
                        index: 0
                    },
                    result;
                result = array.every(function (value, idx) {
                    assert(this === scope);
                    this.index = idx;
                    if (value > 0) {
                        this.sum += value;
                        return true;
                    }
                    return false;
                }, scope);
                assert(false === result);
                assert(6 === scope.sum);
                assert(3 === scope.index);
            });

        });

        describe("filter", function () {

            it("should expose filter(callback)", function () {
                var array = [1, 2, 3, 4, 5],
                    result;
                assert("function" === typeof array.filter);
                assert(!array.hasOwnProperty("filter"));
                result = array.filter(function (value) {
                    return value % 2 === 0;
                });
                assert(result.length === 2);
                assert(result[0] === 2);
                assert(result[1] === 4);
            });

            it("should expose filter(callback, thisArg)", function () {
                var array = [1, 2, 3, 4, 5],
                    obj = {},
                    result;
                result = array.filter(function (value) {
                    assert(this === obj);
                    return value % 2 === 0;
                }, obj);
                assert(result.length === 2);
                assert(result[0] === 2);
                assert(result[1] === 4);
            });

        });

        describe("forEach", function () {

            it("should expose forEach(callback)", function () {
                var array = [1, 2, 3],
                    sum = 0;
                assert("function" === typeof array.forEach);
                assert(!array.hasOwnProperty("forEach"));
                array.forEach(function (value) {
                    sum += value;
                });
                assert(6 === sum);
            });

            it("should expose forEach(callback, thisArg)", function () {
                var array = [1, 2, 3],
                    obj = {
                        sum: 0
                    };
                array.forEach(function (value) {
                    this.sum += value;
                }, obj);
                assert(6 === obj.sum);
            });

        });

        describe("indexOf", function () {

            it("should expose indexOf()", function () {
                var obj = {},
                    array = [1, 2, 3, obj, "abc"];
                assert("function" === typeof array.indexOf);
                assert(!array.hasOwnProperty("indexOf"));
                assert(-1 === array.indexOf(4));
                assert(0 === array.indexOf(1));
                assert(3 === array.indexOf(obj));
                assert(-1 === array.indexOf({}));
                assert(4 === array.indexOf("abc"));
            });

        });

        describe("map", function () {

            it("should expose map(callback, thisArg)", function () {
                var obj = {},
                    array = [1, 2, 3, obj, "abc"],
                    result;
                assert("function" === typeof array.map);
                assert(!array.hasOwnProperty("map"));
                result = array.map(function (value, idx) {
                    assert(this === obj);
                    assert(value === array[idx]);
                    return idx;
                }, obj);
                assert(result.length === array.length);
                assert(result[0] === 0);
                assert(result[4] === 4);
            });

        });

        describe("reduce", function () {

            it("should expose reduce()", function () {
                var array = [0, 1, 2, 3, 4];
                assert("function" === typeof array.reduce);
                // It appears that it is equal to 1 on some implementations (Chrome, NodeJS)
                assert(2 === array.reduce.length || 1 === array.reduce.length);
                assert(!array.hasOwnProperty("reduce"));
            });

            it("should expose reduce() - with no initial value", function () {
                var array = [0, 1, 2, 3, 4],
                    lastIndex = 1;
                assert(10 === array.reduce(function (previousValue, currentValue, index, processedArray) {
                    assert(array === processedArray);
                    assert(lastIndex === index);
                    ++lastIndex;
                    return previousValue + currentValue;
                }));
            });

            it("should expose reduce() - with value", function () {
                var array = [0, 1, 2, 3, 4],
                    lastIndex = 0;
                assert(20 === array.reduce(function (previousValue, currentValue, index, processedArray) {
                    assert(array === processedArray);
                    assert(lastIndex === index);
                    ++lastIndex;
                    return previousValue + currentValue;
                }, 10));
            });

        });

        describe("slice", function () {

            it("provides standard slice", function () {
                var fruits = ["Banana", "Orange", "Lemon", "Apple", "Mango"],
                    citrus = fruits.slice(1, 3);
                assert(2 === citrus.length);
                assert(citrus[0] === "Orange");
                assert(citrus[1] === "Lemon");
            });

        });

    });

    describe("Function", function () {

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

        it("exposes a name", function () {
            function thisName () {}
            assert(thisName.compatibleName() === "thisName");
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

        it("should expose bind(thisArg)", function () {
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
            assert("function" === typeof testFunction.bind);
            assert(!testFunction.hasOwnProperty("bind"));
            bound = testFunction.bind(scope);
            // Check the scope when calling bound
            bound(true);
            assert(true === scope.member);
            // Ignore applied scope when bound
            bound.apply({}, [false]);
            assert(false === scope.member);
        });

    });

    describe("Object", function () {

        describe("create", function () {

            it("should expose create()", function () {
                assert("function" === typeof Object.create);
                assert(2 === Object.create.length || 1 === Object.create.length);
            });

            it("allows creating objects with a given prototype", function () {
                var object = Object.create({
                    method: function () {
                        return "myMethod";
                    }
                });
                assert(!object.hasOwnProperty("method"));
                assert("function" === typeof object.method);
                assert(object.method() === "myMethod");
            });

            it("works with instanceof", function () {
                function A () {
                }
                A.prototype = {
                    a: function () {
                        return "a";
                    }
                };
                var a = Object.create(A.prototype);
                assert(a.a() === "a");
                assert(a instanceof A);
            });

            it("allows inheritance and use of instanceof", function () {
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
                var b = Object.create(B.prototype);
                assert(b.a() === "a");
                assert(b instanceof A);
                assert(b instanceof B);
            });

            // Not implemented and don't want to use
            it("allows to define properties");

        });

        describe("getPrototypeOf", function () {

            it("should expose getPrototypeOf()", function () {
                assert("function" === typeof Object.getPrototypeOf);
                assert(1 === Object.getPrototypeOf.length);
            });

            it("returns prototype passed to Object.create", function () {
                var proto,
                    object;
                proto = {
                    a: function () {
                        return "a";
                    }
                };
                object = Object.create(proto);
                assert(Object.getPrototypeOf(object) === proto);
            });

            it("returns prototype from constructor", function () {
                function A () {
                }
                A.prototype = {
                    constructor: A, // required for cscript
                    a: function () {
                        return "a";
                    }
                };
                var a = new A();
                assert(Object.getPrototypeOf(a) === A.prototype);
            });

        });

    });

    describe("String", function () {

        describe("trim", function () {

            it("should expose trim()", function () {
                var string = " \t  abc\t \t";
                assert("function" === typeof string.trim);
                assert(!string.hasOwnProperty("trim"));
                assert("abc" === string.trim());
            });

        });

    });

});
