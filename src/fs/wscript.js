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
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfFsCloseBuild*/ // Build close method that assess the stream type
/*global _gpfFsExploreEnumerator*/ // IFileStorage.explore helper
/*global _gpfFsSetFileStorageIf*/ // Set the file storage implementation if the host matches
/*global _gpfMsFSO*/ // Scripting.FileSystemObject activeX
/*global _gpfPathDecompose*/ // Normalize path and returns an array of parts
/*global _gpfPathNormalize*/ // Normalize path
/*global _gpfPathNormalize*/ // Normalize path
/*#endif*/

/*jshint wsh:true*/
/*eslint-env wsh*/
/*eslint-disable new-cap*/ // FileSystem object APIs are uppercased
/*global Enumerator*/ // Enumerator helper

_gpfErrorDeclare("fs/wscript", {

    /**
     * ### Summary
     *
     * Path not explorable
     *
     * ### Description
     *
     * This error is used when explore is used with a path that does not point to a folder.
     * @since 0.2.1
     */
    pathNotExplorable: "Path not explorable"

});

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

function _gpfFsWscriptFSOCallWithArg (name, path) {
    return new Promise(function (resolve) {
        _gpfMsFSO[name](_gpfPathDecompose(path).join("\\"));
        resolve();
    });
}

function _gpfFsWscriptFSOCallWithArgAndTrue (name, path) {
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

function _gpfFsWScriptExploreList (collection) {
    var fsoEnum = new Enumerator(collection),
        results = [];
    for (; !fsoEnum.atEnd(); fsoEnum.moveNext()) {
        results.push(fsoEnum.item().Path);
    }
    return results;
}

function _gpfFsWScriptExplore (path) {
    var folder;
    if (_gpfMsFSO.FolderExists(path)) {
        folder = _gpfMsFSO.GetFolder(path);
        return _gpfFsWScriptExploreList(folder.SubFolders)
            .concat(_gpfFsWScriptExploreList(folder.Files));
    }
    gpf.Error.pathNotExplorable();
}

/**
 * WScript specific IFileStorage implementation
 *
 * @class gpf.wscript.FileStorage
 * @implements {gpf.interfaces.IFileStorage}
 * @private
 * @since 0.1.9
 */
var _GpfWScriptFileStorage = _gpfDefine({
    $class: "gpf.wscript.FileStorage",

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
    close: _gpfFsCloseBuild(_GpfWscriptBaseStream),

    /**
     * @gpf:sameas gpf.interfaces.IFileStorage#explore
     * @since 0.1.9
     */
    explore: function (path) {
        var me = this;
        return new Promise(function (resolve) {
            resolve(_gpfFsExploreEnumerator(me, _gpfFsWScriptExplore(_gpfPathDecompose(path).join("\\"))));
        });
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

_gpfFsSetFileStorageIf(_GPF_HOST.WSCRIPT, _GpfWScriptFileStorage);
