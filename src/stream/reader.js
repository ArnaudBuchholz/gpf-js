var
    /**
     * Base class used to fully read a stream
     *
     * @class AbstractStreamReader
     * @abstract
     * @private
     */
    AbstractStreamReader = _gpfDefine("AbstractStreamReader", {

        "+": {

            constructor: function (scope, eventsHandler) {
                this._scope = scope;
                this._eventsHandler = eventsHandler;
            },

            read: function (stream) {
                stream.read(this._readSize, this.callback.bind(this));
            }

        },

        "#": {

            _readSize: 0,

            _consolidateBuffer: function () {
                throw gpf.Error.abstract();
            },

            _addBuffer: function (buffer) {
                _gpfIgnore(buffer);
                throw gpf.Error.abstract();
            }
        },

        "-": {

            _scope: null,
            _eventsHandler: null,

            callback: function (event) {
                var
                    type = event.type(),
                    stream = event.scope();
                if (type === _gpfI.IReadableStream.EVENT_END_OF_STREAM) {
                    _gpfEventsFire.call(this._scope, _gpfI.IReadableStream.EVENT_DATA,
                        {
                            buffer: this._consolidateBuffer()
                        },
                        this._eventsHandler
                    );

                } else if (type === _gpfI.IReadableStream.EVENT_ERROR) {
                    // Forward the event
                    _gpfEventsFire.call(this._scope, event, this._eventsHandler);

                } else {
                    this._addBuffer(event.get("buffer"));
                    this.read(stream);
                }
            }

        }

    }),

    StreamReader = _gpfDefine("StreamReader", AbstractStreamReader, {

        "+": {

            constructor: function (scope, eventsHandler, concatMethod) {
                this._super(scope, eventsHandler);
                this._concatMethod = concatMethod;
            }

        },

        "#": {

            _consolidateBuffer: function () {
                return this._concatMethod(this._buffer);
            },

            _addBuffer: function (buffer) {
                this._buffer = this._concatMethod(this._buffer, buffer);
            }
        },

        "-": {

            _buffer: undefined,
            _concatMethod: null

        }

    }),

    B64StreamReader = _gpfDefine("B64StreamReader", AbstractStreamReader, {

        "+": {

            constructor: function (scope, eventsHandler) {
                this._super(scope, eventsHandler);
                this._buffer = [];
            }

        },

        "#": {

            _readSize: 6,

            _consolidateBuffer: function () {
                return this._buffer.join("");
            },

            _addBuffer: function (buffer) {
                this._buffer.push(gpf.bin.toBase64(buffer[0]));
            }

        },

        "-": {

            _buffer: []

        }

    });

/**
 * Read the whole stream and concat the buffers using the provided handler
 *
 * @param {gpf.interfaces.ITextStream} stream
 * @param {Function} concatMethod
 * @param {gpf.events.Handler} eventsHandler
 *
 * @gpf:forwardThis
 *
 * @event data finished reading the stream, the buffer is provided
 * @eventParam {Array|String} buffer
 */
gpf.stream.readAll = function (stream, concatMethod, eventsHandler) {
    stream = gpf.interfaces.query(stream, _gpfI.IReadableStream,  true);
    (new StreamReader(this, eventsHandler, concatMethod)).read(stream);
};

/**
 * Read the whole stream and returns a base64 string
 *
 * @param {gpf.interfaces.ITextStream} stream
 * @param {gpf.events.Handler} eventsHandler
 *
 * @gpf:forwardThis
 *
 * @event data finished reading the stream, the buffer is provided
 * @eventParam {Array|String} buffer
 */
gpf.stream.readAllAsB64 = function (stream, eventsHandler) {
    stream = new gpf.stream.BitReader(stream);
    (new B64StreamReader(this, eventsHandler)).read(stream);
};
