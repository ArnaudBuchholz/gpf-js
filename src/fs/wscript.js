/**
 * @file WScript specific File System implementation
 * @since 0.1.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_FS_OPENFOR*/ // File system stream opening mode
/*global _GPF_FS_TYPES*/ // File system types constants
/*global _GPF_HOST*/ // Host types
/*global _GpfWscriptBaseStream*/ // gpf.wscript.BaseStream
/*global _GpfWscriptReadableStream*/ // gpf.wscript.ReadableStream
/*global _GpfWscriptWritableStream*/ // gpf.wscript.WritableStream
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfFsExploreEnumerator*/ // IFileStorage.explore helper
/*global _gpfHost*/ // Host type
/*global _gpfHost*/ // Host type
/*global _gpfMsFSO:true*/ // Scripting.FileSystemObject activeX
/*global _gpfPathDecompose*/ // Normalize path and returns an array of parts
/*global _gpfPathNormalize*/ // Normalize path
/*global _gpfPathNormalize*/ // Normalize path
/*global _gpfSetHostFileStorage*/ // Set the result of gpf.fs.getFileStorage
/*#endif*/

/*jshint wsh:true*/
/*eslint-env wsh*/
/*eslint-disable new-cap*/ // FileSystem object APIs are uppercased
/*global Enumerator*/ // Enumerator helper

/* istanbul ignore next */ // Because tested with NodeJS
/**
 * Translate WScript file object into a {@link gpf.typedef.fileStorageInfo}
 *
 * @param {Object} obj WScript file object
 * @param {gpf.fs.types} type Object type
 * @return {gpf.typedef.fileStorageInfo} Information about the object
 * @since 0.1.9
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

/* istanbul ignore next */ // Because tested with NodeJS
function _gpfFsWscriptFSOCallWithArg (name, path) {
    return new Promise(function (resolve) {
        _gpfMsFSO[name](_gpfPathDecompose(path).join("\\"));
        resolve();
    });
}

/* istanbul ignore next */ // Because tested with NodeJS
function _gpfFsWscriptFSOCallWithArgAndTrue (name, path) {
    return new Promise(function (resolve) {
        _gpfMsFSO[name](_gpfPathDecompose(path).join("\\"), true);
        resolve();
    });
}

/* istanbul ignore next */ // Because tested with NodeJS
function _gpfFsWscriptGetFileInfo (path) {
    if (_gpfMsFSO.FileExists(path)) {
        return _gpfFsWScriptObjToFileStorageInfo(_gpfMsFSO.GetFile(path), _GPF_FS_TYPES.FILE);
    }
    return {
        type: _GPF_FS_TYPES.NOT_FOUND
    };
}

/* istanbul ignore next */ // Because tested with NodeJS
function _gpfFsWscriptGetInfo (path) {
    if (_gpfMsFSO.FolderExists(path)) {
        return _gpfFsWScriptObjToFileStorageInfo(_gpfMsFSO.GetFolder(path), _GPF_FS_TYPES.DIRECTORY);
    }
    return _gpfFsWscriptGetFileInfo(path);
}

/* istanbul ignore next */ // Because tested with NodeJS
function _gpfFsWScriptExploreList (collection) {
    var fsoEnum = new Enumerator(collection),
        results = [];
    for (; !fsoEnum.atEnd(); fsoEnum.moveNext()) {
        results.push(fsoEnum.item().Path);
    }
    return results;
}

/* istanbul ignore next */ // Because tested with NodeJS
function _gpfFsWScriptExplore (path) {
    var folder;
    if (_gpfMsFSO.FolderExists(path)) {
        folder = _gpfMsFSO.GetFolder(path);
        return _gpfFsWScriptExploreList(folder.SubFolders)
            .concat(_gpfFsWScriptExploreList(folder.Files));
    }
    return [];
}

/* istanbul ignore next */ // Because tested with NodeJS
var _GpfWScriptFileStorage = _gpfDefine(/** @lends gpf.wscript.FileStorage */ {
    $class: "gpf.wscript.FileStorage",

    /**
     * WScript specific IFileStorage implementation
     *
     * @constructor gpf.wscript.FileStorage
     * @implements {gpf.interfaces.IFileStorage}
     * @private
     * @since 0.1.9
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
        return new Promise(function (resolve) {
            var stream;
            if (_GPF_FS_OPENFOR.READING === mode) {
                stream = new _GpfWscriptReadableStream(_gpfMsFSO.OpenTextFile(path, 1, false));
            } else {
                stream = new _GpfWscriptWritableStream(_gpfMsFSO.OpenTextFile(path, 8, true));
            }
            resolve(stream);
        });
    },

    /**
     * @gpf:sameas gpf.interfaces.IFileStorage#close
     * @since 0.1.9
     */
    close: function (stream) {
        if (stream instanceof _GpfWscriptBaseStream) {
            return stream.close();
        }
        return Promise.reject(new gpf.Error.IncompatibleStream());
    },

    /**
     * @gpf:sameas gpf.interfaces.IFileStorage#explore
     * @since 0.1.9
     */
    explore: function (path) {
        return Promise.resolve(_gpfFsExploreEnumerator(this, _gpfFsWScriptExplore(_gpfPathDecompose(path).join("\\"))));
    },

    /**
     * @gpf:sameas gpf.interfaces.IFileStorage#createDirectory
     * @since 0.1.9
     */
    createDirectory: _gpfFsWscriptFSOCallWithArg.bind(null, "CreateFolder"),

    /**
     * @gpf:sameas gpf.interfaces.IFileStorage#deleteFile
     * @since 0.1.9
     */
    deleteFile: _gpfFsWscriptFSOCallWithArgAndTrue.bind(null, "DeleteFile"),

    /**
     * @gpf:sameas gpf.interfaces.IFileStorage#deleteDirectory
     * @since 0.1.9
     */
    deleteDirectory: _gpfFsWscriptFSOCallWithArgAndTrue.bind(null, "DeleteFolder")

    //endregion

});

/* istanbul ignore next */ // Because tested with NodeJS
if (_GPF_HOST.WSCRIPT === _gpfHost) {

    _gpfSetHostFileStorage(new _GpfWScriptFileStorage());

}
