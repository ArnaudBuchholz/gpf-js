"use strict";
/*global describe, it, assert*/

describe("i_enumerator", function () {

    var
        gpfI = gpf.interfaces,
        gpfE = gpf.events,
        ArrayEnumerable = gpf.define("ArrayEnumerable", {

            private: {

                "[_items]": [gpf.$Enumerable()],
                _items: []

            },

            public: {

                constructor: function (items) {
                    this._items = items;
                }

            }

        });

    describe("Synchronous test", function () {

        it("allows sequential access to items", function () {
            var
                instance,
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
            /*jshint -W040*/
            if (++this._current < 10) {
                return true;
            }
            gpfE.fire(gpfE.EVENT_END_OF_DATA, eventsHandler);
            return false;
        }

        function asyncMoveNext (eventsHandler) {
            /*jshint -W040*/
            if (++this._current < 10) {
                gpfE.fire(gpfE.EVENT_DATA, eventsHandler);
            } else {
                gpfE.fire(gpfE.EVENT_END_OF_DATA, eventsHandler);
            }
            return false;
        }

        describe("synchronous callback", function () {

            it("works with synchronous interface", function (done) {
                var expected = 0;
                gpfI.IEnumerator.each(getEnum(syncMoveNext),
                    function (element) {
                        assert(expected++ === element);
                    }, function (event) {
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
                    }, function (event) {
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
                    }, function (event) {
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
                    }, function (event) {
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
                    }, function (event) {
                        assert(gpfE.EVENT_STOPPED === event.type);
                        assert(5 === expected);
                        done();
                    });
            });

        });

    });

});