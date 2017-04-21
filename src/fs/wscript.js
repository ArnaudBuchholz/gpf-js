/**
 * @file WScript specific File System implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_FS_OPENFOR*/ // File system stream opening mode
/*global _GPF_FS_TYPES*/ // File system types constants
/*global _GPF_HOST*/ // Host types
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfHost*/ // Host type
/*global _gpfPathNormalize*/ // Normalize path
/*global _gpfSetHostFileStorage*/ // Set the result of gpf.fs.getFileStorage
/*global _gpfArrayEnumerator*/ // Create an IEnumerator from an array
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _gpfHost*/ // Host type
/*global _gpfMsFSO:true*/ // Scripting.FileSystemObject activeX
/*global _gpfPathDecompose*/ // Normalize path and returns an array of parts
/*global _gpfPathNormalize*/ // Normalize path
// /*#endif*/

/*jshint wsh:true*/
/*eslint-env wsh*/
/*eslint-disable new-cap*/ // FileSystem object APIs are uppercased

/**
 * Translate WScript file object into a {@link gpf.typedef.fileStorageInfo}
 *
 * @param {Object} obj WScript file object
 * @param {gpf.fs.types} type Object type
 * @return {gpf.typedef.fileStorageInfo} Information about the object
 */
function _gpfFsWScriptObjToFileStorageInfo (obj, type) {
    return {
        type: type,
        fileName: obj.Name.toLowerCase(),
        filePath: _gpfPathNormalize(obj.Path),
        size: obj.Size,
        createdDateTime: new Date(obj.DateCreated),
        modifiedDateTime: new Date(obj.DateLastModified)
    };
}

function _gpfFsWscriptFSOCallWithArgs (name, path) {
    return new Promise(function (resolve) {
        _gpfMsFSO[name](_gpfPathDecompose(path).join("\\"), true);
        resolve();
    });
}

function _gpfFsWscriptGetFileInfo (path) {
    if (_gpfMsFSO.FileExists(path)) {
        return _gpfFsWScriptObjToFileStorageInfo(_gpfMsFSO.GetFile(path), _GPF_FS_TYPES.FILE);
    }
    return {
        type: _GPF_FS_TYPES.NOT_FOUND
    };
}

function _gpfFsWscriptGetInfo (path) {
    if (_gpfMsFSO.FolderExists(path)) {
        return _gpfFsWScriptObjToFileStorageInfo(_gpfMsFSO.GetFolder(path), _GPF_FS_TYPES.DIRECTORY);
    }
    return _gpfFsWscriptGetFileInfo(path);
}

var _gpfWScriptFileStorage = _gpfDefine("gpf.wscript.FileStorage", {

    /**
     * WScript specific IFileStorage implementation
     *
     * @constructor gpf.wscript.FileStorage
     * @implements {gpf.interfaces.IFileStorage}
     */
    constructor: function () {
        if (!_gpfMsFSO) {
            _gpfMsFSO = new ActiveXObject("Scripting.FileSystemObject");
        }
    },

    //region gpf.interfaces.IFileStorage

    /**
     * @gpf:sameas gpf.interfaces.IFileStorage#getInfo
     * @since 0.1.9
     */
    getInfo: function (path) {
        return Promise.resolve(_gpfFsWscriptGetInfo(_gpfPathDecompose(path).join("\\")));
    },

    /**
     * @gpf:sameas gpf.interfaces.IFileStorage#openTextStream
     * @since 0.1.9
     */
    openTextStream: function (path, mode) {
        path = _gpfPathDecompose(path).join("\\");
        if (_GPF_FS_OPENFOR.READING === mode) {
            return _gpfFsWscriptOpenTextStreamForReading(path);
        }
        return _gpfFsWscriptOpenTextStreamForAppending(path);
    },

    /**
     * @gpf:sameas gpf.interfaces.IFileStorage#close
     * @since 0.1.9
     */
    close: function (stream) {
        if (stream instanceof gpf.wscript.BaseStream) {
            return stream.close();
        }
        return Promise.reject(new gpf.Error.IncompatibleStream());
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
            for (; fsoEnum.atEnd(); fsoEnum.moveNext()) {
                result.push(_gpfFsoObjToInfo(fsoEnum.item(),
                    _GPF_FS_TYPE_FILE));
            }
            // folders
            fsoEnum = new Enumerator(folder.SubFolders);
            for (; fsoEnum.atEnd(); fsoEnum.moveNext()) {
                result.push(_gpfFsoObjToInfo(fsoEnum.item(),
                    _GPF_FS_TYPE_DIRECTORY));
            }
        }
        _gpfEventsFire.call(null, _GPF_EVENT_READY, {enumerator: _gpfArrayEnumerator(result)}, eventsHandler);
    },

    /**
     * @gpf:sameas gpf.interfaces.IFileStorage#createDirectory
     * @since 0.1.9
     */
    createDirectory: _gpfFsWscriptFSOCallWithArgs.bind("CreateFolder"),

    /**
     * @gpf:sameas gpf.interfaces.IFileStorage#deleteFile
     * @since 0.1.9
     */
    deleteFile: _gpfFsWscriptFSOCallWithArgs.bind("DeleteFile"),

    /**
     * @gpf:sameas gpf.interfaces.IFileStorage#deleteDirectory
     * @since 0.1.9
     */
    deleteDirectory: _gpfFsWscriptFSOCallWithArgs.bind("DeleteFolder")

    //endregion

});

/* istanbul ignore */ // Because tested with NodeJS
if (_GPF_HOST.WSCRIPT === _gpfHost) {

    _gpfSetHostFileStorage(new _gpfWScriptFileStorage());

}
