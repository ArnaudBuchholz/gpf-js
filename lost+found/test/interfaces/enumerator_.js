"use strict";

describe("interfaces/enumerator", function () {

    describe("IEnumerator", function () {
        it("is a known and static interface", function () {
            /*jshint unused:false*/
            /*eslint-disable no-unused-vars*/
            assert(gpf.interfaces.isImplementedBy({
                reset: function () {},
                moveNext: function (eventsHandler) {},
                current: function () {}
            }, gpf.interfaces.IEnumerator));
            /*jshint unused:true*/
            /*eslint-enable no-unused-vars*/
        });
    });

    var gpfI = gpf.interfaces,
        gpfE = gpf.events,
        ArrayEnumerable = gpf.define("ArrayEnumerable", {
            "private": {

                "[_items]": [gpf.$Enumerable()],
                _items: []

            },
            "public": {

                constructor: function (items) {
                    this._items = items;
                }

            }
        });

    describe("gpf.attributes.EnumerableAttribute", function () {

        it("exposes gpf.interfaces.IEnumerator on instances", function () {
            var test = new ArrayEnumerable(),
                iEnumerator = gpf.interfaces.query(test, gpf.interfaces.IEnumerator, false);
            assert(null !== iEnumerator);
            assert(gpf.interfaces.isImplementedBy(gpf.interfaces.IEnumerator, iEnumerator));
        });

        it("checks that it was used on an array member", function () {
            var caught = false;
            try {
                gpf.define("NotEnumerable", {
                    "private": {

                        "[_notAnArray]": [gpf.$Enumerable()],
                        _notAnArray: null

                    }
                });
            } catch (e) {
                assert(e instanceof gpf.Error);
                assert(e.code === gpf.Error.CODE_ENUMERABLEINVALIDMEMBER);
                assert(e.code === gpf.Error.enumerableInvalidMember.CODE);
                assert(e.name === "enumerableInvalidMember");
                caught = true;
            }
            assert(true === caught);
        });

        it("allows sequential (and synchronous) access to items", function () {
            var instance,
                enumerator;
            instance = new ArrayEnumerable([1, 2, 3]);
            enumerator = gpfI.query(instance, gpfI.IEnumerator);
            assert(null !== enumerator);
            enumerator.reset();
            assert(true === enumerator.moveNext());
            assert(1 === enumerator.current());
            assert(true === enumerator.moveNext());
            assert(2 === enumerator.current());
            assert(true === enumerator.moveNext());
            assert(3 === enumerator.current());
            assert(false === enumerator.moveNext());
            enumerator.reset();
            assert(true === enumerator.moveNext());
            assert(1 === enumerator.current());
        });

        it("supports (simulated) asynchronous access to items", function (done) {
            var instance,
                enumerator,
                last = 0;
            instance = new ArrayEnumerable([1, 2, 3]);
            enumerator = gpfI.query(instance, gpfI.IEnumerator);
            assert(null !== enumerator);
            enumerator.reset();
            function handler (event) {
                try {
                    if (event.type === gpf.events.EVENT_END_OF_DATA) {
                        done();
                        return;
                    }
                    // Not expected
                    assert(false);
                } catch (e) {
                    done(e);
                }
            }
            while (enumerator.moveNext(handler)) {
                assert(enumerator.current() === ++last);
            }
        });

    });

    describe("IEnumerator.each", function () {

        function getEnum (moveNext) {
            return {
                _current: -1,
                reset: function () {
                    assert(false); // Should not be called
                },
                moveNext: moveNext,
                current: function () {
                    return this._current;
                }
            };
        }

        function syncMoveNext (eventsHandler) {
            /*jshint validthis:true*/ // Will be part of enumeration object
            /*eslint-disable no-invalid-this*/
            if (++this._current < 10) {
                return true;
            }
            gpfE.fire(gpfE.EVENT_END_OF_DATA, eventsHandler);
            return false;
            /*eslint-enable no-invalid-this*/
        }

        function asyncMoveNext (eventsHandler) {
            /*jshint validthis:true*/ // Will be part of enumeration object
            /*eslint-disable no-invalid-this*/
            if (++this._current < 10) {
                gpfE.fire(gpfE.EVENT_DATA, eventsHandler);
            } else {
                gpfE.fire(gpfE.EVENT_END_OF_DATA, eventsHandler);
            }
            return false;
            /*eslint-enable no-invalid-this*/
        }

        describe("synchronous callback", function () {

            it("works with synchronous interface", function (done) {
                var expected = 0;
                gpfI.IEnumerator.each(getEnum(syncMoveNext),
                    function (element) {
                        assert(expected++ === element);
                    },
                    function (event) {
                        assert(gpfE.EVENT_END_OF_DATA === event.type);
                        assert(10 === expected);
                        done();
                    });
            });

            it("works with asynchronous interface", function (done) {
                var expected = 0;
                gpfI.IEnumerator.each(getEnum(asyncMoveNext),
                    function (element) {
                        assert(expected++ === element);
                    },
                    function (event) {
                        assert(gpfE.EVENT_END_OF_DATA === event.type);
                        assert(10 === expected);
                        done();
                    });
            });

        });

        describe("asynchronous callback", function () {

            it("works with synchronous interface", function (done) {
                var expected = 0;
                gpfI.IEnumerator.each(getEnum(syncMoveNext),
                    function (element, eventsHandler) {
                        assert(expected++ === element);
                        gpfE.fire(gpfE.EVENT_CONTINUE, eventsHandler);
                    },
                    function (event) {
                        assert(gpfE.EVENT_END_OF_DATA === event.type);
                        assert(10 === expected);
                        done();
                    });
            });

            it("works with asynchronous interface", function (done) {
                var expected = 0;
                gpfI.IEnumerator.each(getEnum(asyncMoveNext),
                    function (element, eventsHandler) {
                        assert(expected++ === element);
                        gpfE.fire(gpfE.EVENT_CONTINUE, eventsHandler);
                    },
                    function (event) {
                        assert(gpfE.EVENT_END_OF_DATA === event.type);
                        assert(10 === expected);
                        done();
                    });
            });

            it("allows stopping the process", function (done) {
                var expected = 0;
                gpfI.IEnumerator.each(getEnum(asyncMoveNext),
                    function (element, eventsHandler) {
                        assert(expected++ === element);
                        if (5 === expected) {
                            gpfE.fire(gpfE.EVENT_STOP, eventsHandler);
                        } else {
                            gpfE.fire(gpfE.EVENT_CONTINUE, eventsHandler);
                        }
                    },
                    function (event) {
                        assert(gpfE.EVENT_STOPPED === event.type);
                        assert(5 === expected);
                        done();
                    });
            });

        });

    });

    describe("IEnumerator.fromArray", function () {

        it("encapsulates an array into an IEnumerator interface", function () {
            var enumerator = gpfI.IEnumerator.fromArray([1, 2, 3]);
            assert(null !== enumerator);
            enumerator.reset();
            assert(true === enumerator.moveNext());
            assert(1 === enumerator.current());
            assert(true === enumerator.moveNext());
            assert(2 === enumerator.current());
            assert(true === enumerator.moveNext());
            assert(3 === enumerator.current());
            assert(false === enumerator.moveNext());
            enumerator.reset();
            assert(true === enumerator.moveNext());
            assert(1 === enumerator.current());
        });

    });

});
