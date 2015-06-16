/*#ifndef(UMD)*/
"use strict";
/*global _GPF_EVENT_DATA*/ // gpf.events.EVENT_DATA
/*global _GPF_EVENT_END_OF_DATA*/ // gpf.events.EVENT_END_OF_DATA
/*global _GPF_EVENT_READY*/ // gpf.events.EVENT_READY
/*global _GPF_FS_TYPE_DIRECTORY*/ // _GPF_FS_TYPE_DIRECTORY
/*global _GPF_FS_TYPE_FILE*/ // _GPF_FS_TYPE_FILE
/*global _GPF_FS_TYPE_NOT_FOUND*/ // _GPF_FS_TYPE_NOT_FOUND
/*global _gpfArrayEnumerator*/ // Create an IEnumerator from an array
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _gpfHost*/ // Host type
/*global _gpfI*/ // gpf.interfaces
/*global _gpfMsFSO:true*/ // Scripting.FileSystemObject activeX
/*global _gpfPathNormalize*/ // Normalize path
// /*#endif*/

var
    /**
     * @type {gpf.fs.WScriptFileStorage}
     * @private
     */
    _gpfWScriptFileStorage,

    /**
     * Translate WScript object info into a file info
     *
     * @param {Scripting.FileSystemObject.File
     * |Scripting.FileSystemObject.Folder} fsoObj
     * @param {Number} type
     * @private
     */
    _gpfFsoObjToInfo = function (fsoObj, type) {
        return {
            type: type,
            fileName: _gpfPathNormalize(fsoObj.Name),
            filePath: _gpfPathNormalize(fsoObj.Path),
            size: fsoObj.Size,
            createdDateTime: fsoObj.DateCreated,
            modifiedDateTime: fsoObj.DateLastModified
        };
    },

    /**
     * Binary stream base class
     *
     * @class {WScriptBinaryStream}
     * @private
     */
    _gpfWScriptBinStream = _gpfDefine("WScriptBinaryStream", {

        public: {

            /**
             * @param {String} path
             * @constructor
             */
            constructor: function (path) {
                this._path = path;
                var stream = this._adoStream
                    = new ActiveXObject("ADODB.Stream");
                stream.Type = 1; /*adTypeBinary*/
                stream.Open();
                stream.Position = 0;
            },

            /**
             * Close the stream
             */
            close: function () {
                this._adoStream.Close();
            }

        },

        protected: {

            /**
             * File path
             * @type {String}
             */
            _path: "",

            /**
             * ADODB.Stream
             * @type {Object}
             */
            _adoStream: null

        }

    }),

    /**
     * Binary stream reader
     *
     * @class {WScriptBinaryReadStream}
     * @implements {gpf.interfaces.IReadableStream}
     * @private
     */
    _gpfWScriptBinReadStream = _gpfDefine("WScriptBinaryReadStream",
        _gpfWScriptBinStream, {

        "[Class]": [gpf.$InterfaceImplement(_gpfI.IReadableStream)],

        public: {

            /**
             * @param {String} path
             * @constructor
             */
            constructor: function (path) {
                this._super(path);
                var stream = this._adoStream;
                stream.LoadFromFile(path);
                stream.Position = 0;
            },

            /**
             * @inheritdoc gpf.interfaces.IReadableStream#read
             */
            read: function (size, eventsHandler) {
                var buffer = this._adoStream.Read(size);
                if (null === buffer) {
                    _gpfEventsFire.apply(this, [_GPF_EVENT_END_OF_DATA, {},
                        eventsHandler]);
                } else {
                    _gpfEventsFire.apply(this, [
                        _GPF_EVENT_DATA,
                        {
                            buffer: buffer
                        },
                        eventsHandler
                    ]);
                }
            }

        }

    }),

    /**
     * Binary stream writer
     *
     * @class {WScriptBinaryWriteStream}
     * @implements {gpf.interfaces.IWritableStream}
     * @private
     */
    _gpfWScriptBinWriteStream = _gpfDefine("WScriptBinaryWriteStream",
        _gpfWScriptBinStream, {

        "[Class]": [gpf.$InterfaceImplement(_gpfI.IWritableStream)],

        public: {

            /**
             * @inheritdoc gpf.interfaces.IWritableStream#write
             */
            write: function (buffer, eventsHandler) {
                this._adoStream.Write(buffer);
                _gpfEventsFire.apply(this, [_GPF_EVENT_READY, {},
                    eventsHandler]);
            },

            /**
             * @inheritdoc WScriptBinaryStream#close
             */
            close: function () {
                this._adoStream.SaveToFile(this._path,
                    2/*adSaveCreateOverWrite*/);
                this._super();
            }

        }

    });

_gpfDefine("gpf.fs.WScriptFileStorage", {

    public: {

        constructor: function () {
            if (!_gpfMsFSO) {
                _gpfMsFSO = new ActiveXObject("Scripting.FileSystemObject");
            }
        },

        //region IFileStorage

        /**
         * @inheritdoc IFileStorage#getInfo
         */
        getInfo: function (path, eventsHandler) {
            if (_gpfMsFSO.FileExists(path)) {
                var file = _gpfMsFSO.GetFile(path);
                _gpfEventsFire.apply(null, [
                    _GPF_EVENT_READY,
                    {
                        info: _gpfFsoObjToInfo(file, _GPF_FS_TYPE_FILE)
                    },
                    eventsHandler
                ]);

            } else if (_gpfMsFSO.FolderExists(path)) {
                var folder = _gpfMsFSO.GetFolder(path);
                _gpfEventsFire.apply(null, [
                    _GPF_EVENT_READY,
                    {
                        info: _gpfFsoObjToInfo(folder, _GPF_FS_TYPE_DIRECTORY)
                    },
                    eventsHandler
                ]);

            } else {
                _gpfEventsFire.apply(null, [
                    _GPF_EVENT_READY,
                    {
                        info: {
                            type: _GPF_FS_TYPE_NOT_FOUND
                        }
                    },
                    eventsHandler
                ]);
            }
        },

        /**
         * @inheritdoc IFileStorage#readAsBinaryStream
         */
        readAsBinaryStream: function (path, eventsHandler) {
            _gpfEventsFire.apply(null, [
                _GPF_EVENT_READY,
                {
                    stream: new _gpfWScriptBinReadStream(path)
                },
                eventsHandler
            ]);
        },

        /**
         * @inheritdoc IFileStorage#writeAsBinaryStream
         */
        writeAsBinaryStream: function (path, eventsHandler) {
            _gpfEventsFire.apply(null, [
                _GPF_EVENT_READY,
                {
                    stream: new _gpfWScriptBinWriteStream(path)
                },
                eventsHandler
            ]);
        },

        /**
         * @inheritdoc IFileStorage#close
         */
        close: function (stream) {
            if (stream instanceof _gpfWScriptBinStream) {
                stream.close();
            }
        },

        /**
         * @inheritdoc IFileStorage#explore
         */
        explore: function (path, eventsHandler) {
            var result = [],
                folder,
                fsoEnum;
            if (_gpfMsFSO.FolderExists(path)) {
                folder = _gpfMsFSO.GetFolder(path);
                // files
                fsoEnum = new Enumerator(folder.Files);
                for(; fsoEnum.atEnd(); fsoEnum.moveNext()) {
                    result.push(_gpfFsoObjToInfo(fsoEnum.item(),
                        _GPF_FS_TYPE_FILE));
                }
                // folders
                fsoEnum = new Enumerator(folder.SubFolders);
                for(; fsoEnum.atEnd(); fsoEnum.moveNext()) {
                    result.push(_gpfFsoObjToInfo(fsoEnum.item(),
                        _GPF_FS_TYPE_DIRECTORY));
                }
            }
            _gpfEventsFire.apply(null, [
                _GPF_EVENT_READY,
                {
                    enumerator: _gpfArrayEnumerator(result)
                },
                eventsHandler
            ]);
        }

        //endregion

    }

});

if ("wscript" === _gpfHost) {

    /**
     * @inheritdoc gpf.fs#host
     * WScript version
     */
    gpf.fs.host = function () {
        if (!_gpfWScriptFileStorage) {
            _gpfWScriptFileStorage = new gpf.fs.WScriptFileStorage();
        }
        return _gpfWScriptFileStorage;
    };

}
