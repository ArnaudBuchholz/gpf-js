"use strict";

describe("compatibility/promise", function () {

    function generateTests (PromiseClass) {

        describe("simple usage", function () {

            it("waits for synchronous fulfilment", function (done) {
                new PromiseClass(function (resolve/*, reject*/) {
                    assert(typeof resolve === "function");
                    resolve("ok");
                })
                    .then(function (value) {
                        assert(value === "ok");
                        done();
                    })["catch"](function (reason) {
                        done(reason);
                    });
            });

            it("waits for asynchronous fulfilment", function (done) {
                var callback;
                new PromiseClass(function (resolve/*, reject*/) {
                    callback = resolve;
                })
                    .then(function (value) {
                        assert(value === "ok");
                        done();
                    })["catch"](function (reason) {
                        done(reason);
                    });
                callback("ok");
            });

            it("waits for synchronous rejection (rejection handler)", function (done) {
                var fulfilled = false;
                new PromiseClass(function (resolve, reject) {
                    assert(typeof reject === "function");
                    reject("ko");
                })
                    .then(function () {
                        fulfilled = true;
                    }, function (reason) {
                        assert(fulfilled === false);
                        assert(reason === "ko");
                        done();
                    })["catch"](function (reason) {
                        done(reason);
                    });
            });

            it("waits for asynchronous rejection (rejection handler)", function (done) {
                var fulfilled = false,
                    callback;
                new PromiseClass(function (resolve, reject) {
                    callback = reject;
                })
                    .then(function () {
                        fulfilled = true;
                    }, function (reason) {
                        assert(fulfilled === false);
                        assert(reason === "ko");
                        done();
                    })["catch"](function (reason) {
                        done(reason);
                    });
                callback("ko");
            });

            it("waits for synchronous rejection (catch handler)", function (done) {
                new PromiseClass(function (resolve, reject) {
                    reject("ko");
                })
                    .then(function () {
                        assert(false);
                    })["catch"](function (reason) {
                        try {
                            assert(reason === "ko");
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });

            it("waits for asynchronous rejection (catch handler)", function (done) {
                var callback;
                new PromiseClass(function (resolve, reject) {
                    callback = reject;
                })
                    .then(function () {
                        assert(false);
                    })["catch"](function (reason) {
                        try {
                            assert(reason === "ko");
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
                callback("ko");
            });

            it("rejects automatically on exception", function (done) {
                new PromiseClass(function (/*resolve, reject*/) {
                    throw new Error("ko");
                })
                    .then(function () {
                        assert(false);
                    }, function (reason) {
                        assert(reason instanceof Error);
                        assert(reason.message === "ko");
                        done();
                    })["catch"](function (reason) {
                        done(reason);
                    });
            });

            it("catches exception from the fulfilment handler", function (done) {
                new PromiseClass(function (resolve/*, reject*/) {
                    resolve("ok");
                })
                    .then(function (value) {
                        assert(value === "ok");
                        throw new Error("ko");
                    })["catch"](function (reason) {
                        try {
                            assert(reason instanceof Error);
                            assert(reason.message === "ko");
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });

            it("catches exception from the rejection handler", function (done) {
                new PromiseClass(function (resolve, reject) {
                    reject("ko");
                })
                    .then(function () {
                        assert(false);
                    }, function (reason) {
                        assert(reason === "ko");
                        throw new Error("ko");
                    })["catch"](function (reason) {
                        try {
                            assert(reason instanceof Error);
                            assert(reason.message === "ko");
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });

        });

        describe("shortcuts", function () {

            it("offers Promise.resolve", function (done) {
                PromiseClass.resolve("ok")
                    .then(function (value) {
                        assert(value === "ok");
                        done();
                    }, function (/*reason*/) {
                        assert(false);
                    })["catch"](function (reason) {
                        done(reason);
                    });
            });

            it("offers Promise.reject", function (done) {
                PromiseClass.reject("ko")
                    .then(function (/*value*/) {
                        assert(false);
                    }, function (reason) {
                        assert(reason === "ko");
                        done();
                    })["catch"](function (reason) {
                        done(reason);
                    });
            });

        });

        describe("chaining", function () {

            it("chains by passing results from one handler to the other", function (done) {
                new PromiseClass(function (resolve/*, reject*/) {
                    resolve("ok 1");
                })
                    .then(function (value) {
                        assert(value === "ok 1");
                        return "ok 2";
                    })
                    .then(undefined, function (reason) {
                        done(reason);
                    })
                    .then(function (value) {
                        assert(value === "ok 2");
                        return "ok 3";
                    })
                    .then(function (value) {
                        assert(value === "ok 3");
                        return "ok 4";
                    })
                    .then(function (value) {
                        assert(value === "ok 4");
                        done();
                    })["catch"](function (reason) {
                        done(reason);
                    });
            });

            it("chains by returning a promise in the fulfilment handler", function (done) {
                new PromiseClass(function (resolve/*, reject*/) {
                    resolve("ok 1");
                })
                    .then(function (value) {
                        assert(value === "ok 1");
                        return PromiseClass.resolve("ok 2");
                    })
                    .then(function (value) {
                        assert(value === "ok 2");
                        return new PromiseClass(function (resolve/*, reject*/) {
                            resolve("ok 3");
                        });
                    })
                    .then(function (value) {
                        assert(value === "ok 3");
                        done();
                    })["catch"](function (reason) {
                        done(reason);
                    });
            });

            it("stops on first error", function (done) {

                new PromiseClass(function (resolve/*, reject*/) {
                    resolve("ok 1");
                })
                    .then(function (value) {
                        assert(value === "ok 1");
                        return "ok 2";
                    })
                    .then(function (value) {
                        assert(value === "ok 2");
                        throw new Error("ko");
                    })
                    .then(function (/*value*/) {
                        assert(false);
                    })["catch"](function (reason) {
                        try {
                            assert(reason instanceof Error);
                            assert(reason.message === "ko");
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });

            });

        });

        describe("synchronisation", function () {

            describe("Promise.all", function () {

                it("succeeds with an empty array", function (done) {
                    PromiseClass.all([])
                        .then(function (values) {
                            assert(values.length === 0);
                            done();
                        })["catch"](function (reason) {
                            done(reason);
                        });
                });

                it("works with one promise", function (done) {
                    PromiseClass.all([PromiseClass.resolve("ok")])
                        .then(function (values) {
                            assert(values.length === 1);
                            assert(values[0] === "ok");
                            done();
                        })["catch"](function (reason) {
                            done(reason);
                        });
                });

                it("waits for all promises to be resolved", function (done) {
                    var promises = [],
                        index;
                    for (index = 0; index < 10; ++index) {
                        promises.push(PromiseClass.resolve(index));
                    }
                    PromiseClass.all(promises)
                        .then(function (values) {
                            assert(values.reduce(function (previousValue, currentValue) {
                                return previousValue + currentValue;
                            }) === 45);
                            done();
                        })["catch"](function (reason) {
                            done(reason);
                        });
                });

                it("fails on the first error", function (done) {
                    var promises = [],
                        index;
                    function resolveOrReject (value) {
                        if (value % 2 === 0) {
                            return PromiseClass.reject(value);
                        }
                        return PromiseClass.resolve(value);
                    }
                    for (index = 0; index < 10; ++index) {
                        promises.push(resolveOrReject(index));
                    }
                    PromiseClass.all(promises)
                        .then(function (/*values*/) {
                            assert(false);
                        })["catch"](function (reason) {
                            try {
                                assert(typeof reason === "number");
                                assert(reason < 10);
                                done();
                            } catch (e) {
                                done(e);
                            }
                        });
                });

            });

            describe("Promise.race", function () {

                it("waits for the first promise that is resolved", function (done) {
                    var promises = [],
                        index,
                        callbacks = [];
                    function resolveAfter (value) {
                        return new PromiseClass(function (resolve/*, reject*/) {
                            callbacks.unshift(resolve.bind(null, value)); // reverse order
                        });
                    }
                    for (index = 0; index < 10; ++index) {
                        promises.push(resolveAfter(index));
                    }
                    PromiseClass.race(promises)
                        .then(function (value) {
                            assert(value === 9);
                            callbacks[9](); // Ignored
                            done();
                        })["catch"](function (reason) {
                            done(reason);
                        });
                    callbacks[0](); // Only this one should win Promise.race
                    callbacks[1]();
                    callbacks[2]();
                });

                it("waits for the first promise that is resolved or rejected", function (done) {
                    var promises = [],
                        index,
                        callbacks = [];
                    function resolveOrRejectAfter (value) {
                        return new PromiseClass(function (resolve, reject) {
                            if (value === 5) {
                                callbacks.push(reject.bind(null, value));
                            } else {
                                callbacks.push(resolve.bind(null, value));
                            }
                        });
                    }
                    for (index = 0; index < 10; ++index) {
                        promises.push(resolveOrRejectAfter(index));
                    }
                    PromiseClass.race(promises)
                        .then(function (/*values*/) {
                            assert(false);
                        })["catch"](function (reason) {
                            try {
                                assert(typeof reason === "number");
                                assert(reason === 5);
                                callbacks[9](); // Ignored
                                done();
                            } catch (e) {
                                done(e);
                            }
                        });
                    callbacks[5](); // Only this one should win Promise.race
                    callbacks[0]();
                    callbacks[1]();
                });

            });

        });

        describe("branching", function () {

            it("supports different branches", function (done) {
                var deferred = {};
                deferred.promise = new PromiseClass(function (resolve, reject) {
                    deferred.resolve = resolve;
                    deferred.reject = reject;
                });
                // branch 1
                var branch1 = deferred.promise
                    .then(function (value) {
                        return value + 1;
                    })
                    .then(function (value) {
                        return value + 2;
                    })
                    .then(function (value) {
                        return value + 3;
                    });
                // branch 2
                var branch2 = deferred.promise
                    .then(function (value) {
                        return 2 * value;
                    })
                    .then(function (value) {
                        return 3 * value;
                    });
                PromiseClass.all([branch1, branch2])
                    .then(function (values) {
                        assert(values[0] === 7);
                        assert(values[1] === 6);
                        done();
                    })["catch"](function (e) {
                        done(e);
                    });
                deferred.resolve(1);
            });

        });

    }

    describe("Promise", function () {

        generateTests(Promise);

    });

    if (gpf.internals && Promise !== gpf.internals._GpfPromise) {

        describe("(internal) _GpfPromise", function () {

            generateTests(gpf.internals._GpfPromise);

        });

    }

});
