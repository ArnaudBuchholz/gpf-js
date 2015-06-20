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
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfMsFSO:true*/ // Scripting.FileSystemObject activeX
/*global _gpfPathDecompose*/ // Normalize path and returns an array of parts
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
            fileName: fsoObj.Name.toLowerCase(),
            filePath: _gpfPathNormalize(fsoObj.Path),
            size: fsoObj.Size,
            createdDateTime: fsoObj.DateCreated,
            modifiedDateTime: fsoObj.DateLastModified
        };
    },

    /**
     * String representing character & binary mapping
     *
     * @type {String|String[]}
     * @private
     */
    _gpf437chars = "C7|FC|E9|E2|E4|E0|E5|E7|EA|EB|E8|EF|EE|EC|C4|C5|C9|E6|C6" +
        "|F4|F6|F2|FB|F9|FF|D6|DC|A2|A3|A5|20A7|192|E1|ED|F3|FA|F1|D1|AA|BA" +
        "|BF|2310|AC|BD|BC|A1|AB|BB|2591|2592|2593|2502|2524|2561|2562|2556" +
        "|2555|2563|2551|2557|255D|255C|255B|2510|2514|2534|252C|251C|2500" +
        "|253C|255E|255F|255A|2554|2569|2566|2560|2550|256C|2567|2568|2564" +
        "|2565|2559|2558|2552|2553|256B|256A|2518|250C|2588|2584|258C|2590" +
        "|2580|3B1|DF|393|3C0|3A3|3C3|B5|3C4|3A6|398|3A9|3B4|221E|3C6|3B5" +
        "|2229|2261|B1|2265|2264|2320|2321|F7|2248|B0|2219|B7|221A|207F" +
        "|B2|25A0|A0",

    /**
     * Convert hexadecimal character code into a character
     *
     * @param {String} hexa Hexadecimal character code
     * @returns {String} Character
     * @private
     */
    _gpfCharCodeFromHexa = function (hexa) {
        return String.fromCharCode(parseInt(hexa, 16));
    },

    /**
     * Build the 256 characters composing the code page 437
     *
     * @private
     */
    _gpfBuild437chars = function () {
        var asciiChars = [],
            idx;
        for (idx = 128; idx > 0;) {
            asciiChars.unshift(String.fromCharCode(--idx));
        }
        _gpf437chars = asciiChars.concat(_gpf437chars
            .split("|")
            .map(_gpfCharCodeFromHexa)
        );
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
             * @param {Boolean} [load=false] load load from file
             * @constructor
             */
            constructor: function (path, load) {
                this._path = _gpfPathDecompose(path).join("\\");
                var stream = this._adoStream
                    = new ActiveXObject("ADODB.Stream");
                // https://en.wikipedia.org/wiki/Code_page_437
                stream.Open();
                if (load) {
                    stream.LoadFromFile(this._path);
                }
                stream.Position = 0;
                stream.Type = 2; /*adTypeText*/
                stream.CharSet = "437";
                if (256 !== _gpf437chars.length) {
                    _gpfBuild437chars();
                }
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
                this._super(path, true);
            },

            /**
             * @inheritdoc gpf.interfaces.IReadableStream#read
             */
            read: function (size, eventsHandler) {
                debugger;
                var buffer = this._adoStream.ReadText();
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
     * Convert bytes into its code page 437 representation
     *
     * @param {Number} value
     * @returns {String}
     * @private
     */
    _gpfByteTo437 = function (value) {
        return _gpf437chars[value];
    },

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
                var buffer437 = buffer.map(_gpfByteTo437);
                this._adoStream.WriteText(buffer437.join(""));
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
            path = _gpfPathDecompose(path).join("\\");
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
            path = _gpfPathDecompose(path).join("\\");
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
        },

        /**
         * @inheritdoc IFileStorage#createFolder
         */
        createFolder: function (path, eventsHandler) {
            path = _gpfPathDecompose(path).join("\\");
            _gpfMsFSO.CreateFolder(path);
            _gpfEventsFire.apply(null, [_GPF_EVENT_READY, {}, eventsHandler]);
        },

        /**
         * @inheritdoc IFileStorage#deleteFile
         */
        deleteFile: function (path, eventsHandler) {
            path = _gpfPathDecompose(path).join("\\");
            _gpfMsFSO.DeleteFile(path, true);
            _gpfEventsFire.apply(null, [_GPF_EVENT_READY, {}, eventsHandler]);
        },

        /**
         * @inheritdoc IFileStorage#deleteFolder
         */
        deleteFolder: function (path, eventsHandler) {
            path = _gpfPathDecompose(path).join("\\");
            _gpfMsFSO.DeleteFolder(path, true);
            _gpfEventsFire.apply(null, [_GPF_EVENT_READY, {}, eventsHandler]);
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
