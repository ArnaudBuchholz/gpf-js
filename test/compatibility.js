"use strict";

// Because some of this functions have more than 3 parameters
/*jshint -W072*/
/*eslint-disable max-params*/
/*eslint-disable space-before-keywords*/

describe("compatibility", function () {

    function arrayMethodShouldIgnoreUndefined (method) {
        var array = new Array(5);
        array[2] = undefined;
        array[3] = 3;
        method.call(array, function (value, idx) {
            assert(idx === 2 || idx === 3);
            if (idx === 2) {
                assert(undefined === value);
            } else {
                assert(value === 3);
            }
        });
    }

    var tests = {

            Array: {
                every: {
                    length: 1,
                    "must return true when it goes over all items": function (method) {
                        var array = [1, 2, 3, -6, 10],
                            sum = 0,
                            result;
                        result = method.call(array, function (value) {
                            sum += value;
                            return true;
                        });
                        assert(result === true);
                        assert(sum === 10);
                    },
                    "must return false when it stops on a given item": function (method) {
                        var array = [1, 2, 3, -6, 10],
                            sum = 0,
                            result;
                        result = method.call(array, function (value) {
                            if (value > 0) {
                                sum += value;
                                return true;
                            }
                            return false;
                        });
                        assert(result === false);
                        assert(sum === 6);
                    },
                    "must iterate with a bound context": function (method) {
                        var array = [1, 2, 3, -6, 10],
                            scope = {
                                sum: 0,
                                index: 0
                            },
                            result;
                        result = method.call(array, function (value, idx) {
                            var me = this; //eslint-disable-line no-invalid-this
                            assert(me === scope);
                            me.index = idx;
                            if (value > 0) {
                                me.sum += value;
                                return true;
                            }
                            return false;
                        }, scope);
                        assert(result === false);
                        assert(scope.sum === 6);
                        assert(scope.index === 3);
                    },
                    "must ignore undefined members": arrayMethodShouldIgnoreUndefined
                },
                filter: {
                    length: 1,
                    "must filter": function (method) {
                        var array = [1, 2, 3, 4, 5],
                            result;
                        result = method.call(array, function (value) {
                            return value % 2 === 0;
                        });
                        assert(result.length === 2);
                        assert(result[0] === 2);
                        assert(result[1] === 4);
                    },
                    "must filter with a bound context": function (method) {
                        var array = [1, 2, 3, 4, 5],
                            obj = {},
                            result;
                        result = method.call(array, function (value) {
                            assert(this === obj); //eslint-disable-line no-invalid-this
                            return value % 2 === 0;
                        }, obj);
                        assert(result.length === 2);
                        assert(result[0] === 2);
                        assert(result[1] === 4);
                    },
                    "must ignore undefined members": arrayMethodShouldIgnoreUndefined
                },
                forEach: {
                    length: 1,
                    "must iterate": function (method) {
                        var array = [1, 2, 3],
                            sum = 0;
                        assert(typeof array.forEach === "function");
                        assert(!array.hasOwnProperty("forEach"));
                        method.call(array, function (value) {
                            sum += value;
                        });
                        assert(sum === 6);
                    },
                    "must iterate with a bound context": function (method) {
                        var array = [1, 2, 3],
                            obj = {
                                sum: 0
                            };
                        method.call(array, function (value) {
                            this.sum += value; //eslint-disable-line no-invalid-this
                        }, obj);
                        assert(obj.sum === 6);
                    },
                    "must ignore undefined members": arrayMethodShouldIgnoreUndefined
                },
                indexOf: {
                    length: 1,
                    "must expose indexOf()": function (method) {
                        var obj = {},
                            array = [1, 2, 3, obj, "abc"];
                        assert(method.call(array, 4) === -1);
                        assert(method.call(array, 1) === 0);
                        assert(method.call(array, obj) === 3);
                        assert(method.call(array, {}) === -1);
                        assert(method.call(array, "abc") === 4);
                    }
                },
                map: {
                    length: 1,
                    "must map with a bound context": function (method) {
                        var obj = {},
                            array = [1, 2, 3, obj, "abc"],
                            result;
                        assert(typeof array.map === "function");
                        assert(!array.hasOwnProperty("map"));
                        result = method.call(array, function (value, idx) {
                            assert(this === obj); //eslint-disable-line no-invalid-this
                            assert(value === array[idx]);
                            return idx;
                        }, obj);
                        assert(result.length === array.length);
                        assert(result[0] === 0);
                        assert(result[4] === 4);
                    },
                    "must ignore undefined members": arrayMethodShouldIgnoreUndefined
                },
                reduce: {
                    length: 1,
                    "must reduce with no initial value": function (method) {
                        var array = [0, 1, 2, 3, 4],
                            lastIndex = 1;
                        function reducer (previousValue, currentValue, index, processedArray) {
                            assert(array === processedArray);
                            assert(lastIndex === index);
                            ++lastIndex;
                            return previousValue + currentValue;
                        }
                        assert(method.call(array, reducer) === 10);
                    },
                    "must reduce with intial value": function (method) {
                        var array = [0, 1, 2, 3, 4],
                            lastIndex = 0;
                        function reducer (previousValue, currentValue, index, processedArray) {
                            assert(array === processedArray);
                            assert(lastIndex === index);
                            ++lastIndex;
                            return previousValue + currentValue;
                        }
                        assert(method.call(array, reducer, 10) === 20);
                    }
                },
                some: {
                    length: 1,
                    "returns false when all members return false": function (method) {
                        var array = [2, 5, 8, 1, 4];
                        assert(method.call(array, function (element) {
                            return element > 10;
                        }) === false);
                    },
                    "returns true when at least one member returns true": function (method) {
                        var array = [12, 5, 8, 1, 4];
                        assert(method.call(array, function (element) {
                            return element > 10;
                        }) === true);
                    }
                },
                from: {
                    isStatic: true,
                    length: 1,
                    "works on arguments": function (method) {
                        function f () {
                            return method.call(Array, arguments);
                        }
                        var result = f(1, 2, 3);
                        assert(result instanceof Array);
                        assert(result.length === 3);
                        assert(result[0] === 1);
                        assert(result[1] === 2);
                        assert(result[2] === 3);
                    },
                    "works on strings": function (method) {
                        var result = method.call(Array, "foo");
                        assert(result instanceof Array);
                        assert(result.length === 3);
                        assert(result[0] === "f");
                        assert(result[1] === "o");
                        assert(result[2] === "o");
                    },
                    "supports callback mapping": function (method) {
                        var result = method.call(Array, [1, 2, 3], function (value) {
                            return value + value;
                        });
                        assert(result instanceof Array);
                        assert(result.length === 3);
                        assert(result[0] === 2);
                        assert(result[1] === 4);
                        assert(result[2] === 6);
                    },
                    "generates a sequence of numbers": function (method) {
                        var result = method.call(Array, {length: 3}, function (x, index) {
                            return index;
                        });
                        assert(result instanceof Array);
                        assert(result.length === 3);
                        assert(result[0] === 0);
                        assert(result[1] === 1);
                        assert(result[2] === 2);
                    }
                },
                isArray: {
                    isStatic: true,
                    length: 1,
                    "detects an array": function (method) {
                        assert(method.call(Array, []) === true);
                    },
                    "rejects other objects": function (method) {
                        assert(method.call(Array, {length: 0}) === false);
                    }
                }
            },

            Function: {
                bind: {
                    length: 1,
                    "must bind to a context": function (method) {
                        var scope = {
                                member: null
                            },
                            bound;
                        function testFunction (value) {
                            /*jshint validthis:true*/
                            /*eslint-disable no-invalid-this*/
                            assert(this === scope);
                            this.member = value;
                            /*eslint-enable no-invalid-this*/
                        }
                        bound = method.call(testFunction, scope);
                        // Check the scope when calling bound
                        bound(true);
                        assert(scope.member === true);
                        // Ignore applied scope when bound
                        bound.call({}, false);
                        assert(scope.member === false);
                    },
                    "must return the same result": function (method) {
                        function testFunction (value) {
                            return value;
                        }
                        var boundFunction = method.call(testFunction, {});
                        assert(boundFunction(false) === false);
                        assert(boundFunction(true) === true);
                    },
                    "must preserve function signature": function (method) {
                        function f1 (a, b, c) {
                            return a + b + c;
                        }
                        assert(f1.length === 3);
                        var f2 = method.call(f1, {});
                        assert(f2.length === 3);
                    },
                    "must allow additional parameters binding": function (method) {
                        function f1 (a, b, c) {
                            return a + b + c;
                        }
                        assert(f1.length === 3);
                        var f2 = method.call(f1, {}, 1);
                        assert(f2.length === 2);
                        assert(f2(2, 3) === 6);
                    }
                }
            },

            Object: {
                assign: {
                    isStatic: true,
                    length: 2,
                    "extends objects members": function (method) {
                        var destination = {
                                "member1": "member1",
                                "member2": 2
                            },
                            source = {
                                "newMember": true
                            },
                            result = method.call(Object, destination, source);
                        assert(result === destination); // Same object reference is returned
                        assert(result.member1 === "member1"); // Existing members are preserved
                        assert(result.member2 === 2); // Existing members are preserved
                        assert(result.newMember === true); // New member added
                        assert(source.newMember === true); // Source is not altered
                    },
                    "overwrites existing members": function (method) {
                        var destination = {
                                "member1": "member1"
                            },
                            source = {
                                "member1": false
                            },
                            result = method.call(Object, destination, source);
                        assert(result.member1 === false); // Overwritten
                    },
                    "supports more than one source parameter": function (method) {
                        var destination = {
                                "member1": "member1",
                                "member2": 2
                            },
                            result = method.call(Object, destination, {
                                "source1": 1,
                                "member1": "member1.1"
                            }, {
                                "source2": 2,
                                "member1": "member1.2"
                            });
                        assert(result.member1 === "member1.2"); // Last one wins
                        assert(result.member2 === 2); // Existing members are preserved
                        assert(result.source1 === 1); // Processed first source
                        assert(result.source2 === 2); // Processed second source
                    }
                },
                create: {
                    isStatic: true,
                    length: -1, // ignore
                    "allows creating objects with a given prototype": function (method) {
                        var object = method.call(Object, {
                            method: function () {
                                return "myMethod";
                            }
                        });
                        assert(!object.hasOwnProperty("method"));
                        assert(typeof object.method === "function");
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
                        var a = method.call(Object, A.prototype);
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
                        var b = method.call(Object, B.prototype);
                        assert(b.a() === "a");
                        assert(b instanceof A);
                        assert(b instanceof B);
                    }
                },
                getPrototypeOf: {
                    isStatic: true,
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
                        assert(method.call(Object, object) === proto);
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
                        assert(method.call(Object, a) === A.prototype);
                    }
                },
                keys: {
                    isStatic: true,
                    length: 1,
                    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
                    "returns list of indexes of an array": function (method) {
                        var arr = ["a", "b", "c"],
                            keys = method.call(Object, arr);
                        assert(keys.length === 3);
                        assert(keys[0] === "0");
                        assert(keys[1] === "1");
                        assert(keys[2] === "2");
                    },
                    "returns list of indexes of an array-like object": function (method) {
                        var obj = {0: "a", 1: "b", 2: "c"},
                            keys = method.call(Object, obj);
                        assert(keys.length === 3);
                        // Order is not guaranteed
                        assert(keys.indexOf("0") > -1);
                        assert(keys.indexOf("1") > -1);
                        assert(keys.indexOf("2") > -1);
                    },
                    "returns list of indexes of an array like object with random key ordering": function (method) {
                        var obj = {100: "a", 2: "b", 7: "c"},
                            keys = method.call(Object, obj);
                        assert(keys.length === 3);
                        // Order is not guaranteed
                        assert(keys.indexOf("2") > -1);
                        assert(keys.indexOf("7") > -1);
                        assert(keys.indexOf("100") > -1);
                    },
                    "returns list of own keys of an object": function (method) {
                        function MyObject () {}
                        MyObject.prototype = {
                            a: 0,
                            b: 1
                        };
                        var obj = new MyObject(),
                            keys;
                        obj.c = 2;
                        keys = method.call(Object, obj);
                        assert(keys.length === 1);
                        assert(keys[0] === "c");
                    }
                },
                values: {
                    isStatic: true,
                    length: 1,
                    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values
                    "returns list of values of an object": function (method) {
                        var obj = {foo: "bar", baz: 42},
                            values = method.call(Object, obj);
                        assert(values.length === 2);
                        // Order is not guaranteed
                        assert(values.indexOf("bar") > -1);
                        assert(values.indexOf(42) > -1);
                    },
                    "returns list of values of an array-like object": function (method) {
                        var obj = {0: "a", 1: "b", 2: "c"},
                            values = method.call(Object, obj);
                        assert(values.length === 3);
                        // Order is not guaranteed
                        assert(values.indexOf("a") > -1);
                        assert(values.indexOf("b") > -1);
                        assert(values.indexOf("c") > -1);
                    },
                    "returns list of values of an array like object with random key ordering": function (method) {
                        var obj = {100: "a", 2: "b", 7: "c"},
                            values = method.call(Object, obj);
                        assert(values.length === 3);
                        // Order is not guaranteed
                        assert(values.indexOf("a") > -1);
                        assert(values.indexOf("b") > -1);
                        assert(values.indexOf("c") > -1);
                    },
                    "returns list of own values of an object": function (method) {
                        function MyObject () {}
                        MyObject.prototype = {
                            a: 0,
                            b: 1
                        };
                        var obj = new MyObject(),
                            values;
                        obj.c = 2;
                        values = method.call(Object, obj);
                        assert(values.length === 1);
                        assert(values[0] === 2);
                    }
                }
            },

            String: {
                trim: {
                    length: 0,
                    "must trim left and right": function (method) {
                        var string = " \t  abc\t \t";
                        assert(method.call(string) === "abc");
                    }
                },
                endsWith: {
                    length: 1,
                    "must return true if string ends by the provided one": function (method) {
                        assert(method.call("To be, or not to be, that is the question.", "question."));
                    },
                    "must return false if string does not end by the provided one": function (method) {
                        assert(!method.call("To be, or not to be, that is the question.", "to be"));
                    },
                    "accepts a length parameter to fix input string size": function (method) {
                        assert(method.call("To be, or not to be, that is the question.", "to be", 19));
                    }
                }
            },

            Date: {
                toISOString: {
                    length: 0,
                    "converts to UTC string": function (method) {
                        var date = new Date("2003-01-22T22:45:00.000Z");
                        assert(method.call(date) === "2003-01-22T22:45:00.000Z");
                    }
                },
                now: {
                    isStatic: true,
                    length: 0,
                    "Gives current time": function (method) {
                        var usualNow = new Date().getTime(),
                            dateNow = method.call(Date);
                        assert(typeof dateNow === "number");
                        assert(usualNow <= dateNow);
                    }
                }
            }

        },
        constructors = {
            Array: Array,
            Function: Function,
            Object: Object,
            String: String,
            Date: Date
        };

    function shouldExpose (sample, methodName, arity) {
        var baseLabel = "must expose the method " + methodName;
        if (sample instanceof Function) {
            it(baseLabel, function () {
                assert(typeof sample[methodName] === "function");
            });
        } else {
            it(baseLabel + " through prototype", function () {
                assert(typeof sample[methodName] === "function");
                assert(!sample.hasOwnProperty(methodName));
            });
        }
        if (arity !== -1) {
            it(baseLabel + " with an expected arity of " + arity, function () {
                assert(sample[methodName].length === arity);
            });
        }
    }

    function addTest (description) {
        var sample = description.sample,
            testMethod = description.testMethod,
            label = description.label,
            methodName = description.methodName,
            method = sample[methodName],
            compatibleType,
            compatibleMethods,
            compatibleMethod;
        it(label, function () {
            testMethod(method);
        });
        if (gpf.internals) {
            compatibleType = gpf.internals._gpfCompatibility[description.type];
            if (description.isStatic) {
                compatibleMethods = compatibleType.statics;
            } else {
                compatibleMethods = compatibleType.methods;
            }
            if (compatibleMethods) {
                compatibleMethod = compatibleMethods[methodName];
            }
            if (compatibleMethod && compatibleMethod !== method) {
                it(label + " (compatible)", function () {
                    testMethod(compatibleMethod);
                });
            }
        }
    }

    function describeMethod (type, methodName, methodTests) {
        return function () {
            var Constructor = constructors[type],
                sample,
                label;
            if (methodTests.isStatic === true) {
                sample = Constructor;
            } else {
                sample = new Constructor();
            }
            shouldExpose(sample, methodName, methodTests.length);
            for (label in methodTests) {
                if (methodTests.hasOwnProperty(label) && typeof methodTests[label] === "function") {
                    addTest({
                        type: type,
                        sample: sample,
                        methodName: methodName,
                        isStatic: methodTests.isStatic,
                        label: label,
                        testMethod: methodTests[label]
                    });
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

            it("must allow building an array with a given size", function () {
                var array = new Array(5),
                    idx;
                assert(array.length === 5);
                for (idx = 0; idx < 5; ++idx) {
                    assert(undefined === array[idx]);
                }
                assert(array.join(" ") === "    ");
            });

            it("provides standard slice", function () {
                var fruits = ["Banana", "Orange", "Lemon", "Apple", "Mango"],
                    citrus = fruits.slice(1, 3);
                assert(citrus.length === 2);
                assert(citrus[0] === "Orange");
                assert(citrus[1] === "Lemon");
            });

        });

        declare("Array");

    });

    describe("Function", function () {

        describe("default support", function () {

            it("allows creating function with parameters", function () {
                /*jshint -W064*/
                /*jshint -W061*/
                var thisName = Function("value", "return value;"); //eslint-disable-line no-new-func
                /*jshint +W061*/
                /*jshint +W064*/
                assert(thisName.length === 1);
                assert(thisName(123) === 123);
            });

            it("must detect undefined parameter", function () {
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
                var Func = Function, // prevent linter error
                    testableFunc = new Func("return function funcName () {}")(); // prevent minification
                assert(testableFunc.compatibleName() === "funcName");
            });

            it("supports empty name", function () {
                assert(function () {}.compatibleName() === "");
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

    describe("Date", function () {

        describe("constructor", function () {

            it("accepts UTC string", function () {
                var date = new Date("2003-01-22T22:45:00.000Z");
                assert(date.getUTCFullYear() === 2003);
                assert(date.getUTCMonth() === 0);
                assert(date.getUTCDate() === 22);
                assert(date.getUTCHours() === 22);
                assert(date.getUTCMinutes() === 45);
                assert(date.getUTCSeconds() === 0);
            });

            it("accepts a date only", function () {
                var date = new Date("2003-01-22");
                assert(date.getUTCFullYear() === 2003);
                assert(date.getUTCMonth() === 0);
                assert(date.getUTCDate() === 22);
                assert(date.getUTCHours() === 0);
                assert(date.getUTCMinutes() === 0);
                assert(date.getUTCSeconds() === 0);
            });

        });

        declare("Date");

        if (gpf.internals) {

            describe("(internal) _gpfIsISO8601String", function () {
                var _gpfIsISO8601String = gpf.internals._gpfIsISO8601String,
                    _tests = {
                        "2016-02-17T23:13:00.000Z": [2016, 1, 17, 23, 13, 0, 0],
                        "2003-01-22T22:45:34.075Z": [2003, 0, 22, 22, 45, 34, 75],
                        "2003-13-22T22:45:34.075Z": null,
                        "2003-1-22T22:45:34.075Z": null,
                        "2003-01-32T22:45:34.075Z": null,
                        "2003-01-2T22:45:34.075Z": null,
                        "2003-01-22T25:45:34.075Z": null,
                        "2003-01-22T22:60:34.075Z": null,
                        "2003-01-22T22:45:60.075Z": null,
                        "2003-01-22T22:45:34": [2003, 0, 22, 22, 45, 34, 0],
                        "2003-01-22 22:45:34": null,
                        "2003-01-22T22:45:34.075": null,
                        "2016-02-17": [2016, 1, 17, 0, 0, 0, 0],
                        "2003-13-22": null,
                        "2003-01-32": null
                    };

                function _genTest (string, expected) {
                    var label;
                    if (expected) {
                        label = "accepts";
                    } else {
                        label = "rejects";
                    }
                    label += " \"" + string + "\"";
                    it(label, function () {
                        var result = _gpfIsISO8601String(string);
                        if (expected) {
                            assert(result);
                            assert(result.length === expected.length);
                            expected.forEach(function (dateTimeDivision, index) {
                                assert(result[index] === dateTimeDivision);
                            });
                        } else {
                            assert(!result);
                        }
                    });
                }

                for (var dateString in _tests) {
                    if (_tests.hasOwnProperty(dateString)) {
                        _genTest(dateString, _tests[dateString]);
                    }
                }

                [
                    true,
                    false,
                    0,
                    1,
                    {},
                    new Date()
                ].forEach(function (value) {
                    it("rejects other formats - " + typeof value + " (" + value.toString() + ")", function () {
                        assert(undefined === _gpfIsISO8601String(value));
                    });
                });

            });

            describe("(internal) _GpfDate()", function () {

                /*jshint -W055*/

                var _GpfDate = gpf.internals._GpfDate;

                it("allocates a Date object", function () {
                    var now = new _GpfDate();
                    assert(now instanceof Date);
                });

                it("detects and leverage ISO 8601 format", function () {
                    var date = new _GpfDate("2003-01-22T22:45:34.075Z");
                    assert(date.getUTCFullYear() === 2003);
                    assert(date.getUTCMonth() === 0);
                    assert(date.getUTCDate() === 22);
                    assert(date.getUTCHours() === 22);
                    assert(date.getUTCMinutes() === 45);
                    assert(date.getUTCSeconds() === 34);
                    assert(date.getUTCMilliseconds() === 75);
                });

                it("detects and leverage ISO 8601 short format", function () {
                    var date = new _GpfDate("2003-01-22");
                    assert(date.getUTCFullYear() === 2003);
                    assert(date.getUTCMonth() === 0);
                    assert(date.getUTCDate() === 22);
                    assert(date.getUTCHours() === 0);
                    assert(date.getUTCMinutes() === 0);
                    assert(date.getUTCSeconds() === 0);
                    assert(date.getUTCMilliseconds() === 0);
                });

                /*jshint +W055*/

            });

        }

    });

});
