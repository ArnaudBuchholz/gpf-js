"use strict";

const
    fs = require("fs"),
    fsPath = require("path"),

    normalizePath = path => path.split("\\").join("/"),

    getSafeStat = path => {
        try {
            const stat = fs.lstatSync(path);
            return {
                isFile: stat.isFile(),
                isDirectory: stat.isDirectory()
            };
        } catch (e) {
            return {
                isFile: false,
                isDirectory: false
            };
        }
    };

class FileSystemItem {

    constructor (path) {
        this._path = path;
    }

    get Name () {
        return this._path.split("/").pop();
    }

    get Path () {
        return this._path;
    }

    _getStat () {
        if (!this._stat) {
            this._stat = fs.lstatSync(this._path);
        }
        return this._stat;
    }

    get Size () {
        return this._getStat().size;
    }

    get DateCreated () {
        return this._getStat().ctimeMs;
    }

    get DateLastModified () {
        return this._getStat().mtimeMs;
    }

}

class File extends FileSystemItem {

    constructor (path, forAppending) {
        super(path);
        this._fileMode = forAppending ? "a" : "r";
    }

    ReadAll () {
        return fs.readFileSync(this._path).toString();
    }

    _getFileDescriptor () {
        if (!this._fd) {
            this._fd = fs.openSync(this._path, this._fileMode);
        }
        return this._fd;
    }

    Read (size) {
        const
            buffer = Buffer.alloc(size),
            count = fs.readSync(this._getFileDescriptor(), buffer, 0, size, null);
        this._streamNotEnded = count !== 0;
        return buffer.toString().substring(0, count);
    }

    Write (buffer) {
        fs.writeSync(this._getFileDescriptor(), buffer);
    }

    get AtEndOfStream () {
        return !this._streamNotEnded;
    }

    Close () {
        if (this._fd) {
            fs.closeSync(this._fd);
        }
    }

}

class Folder extends FileSystemItem {

    _getDirContent () {
        if (!this._dirContent) {
            this._dirContent = fs.readdirSync(this._path)
                .map(name => fsPath.join(this._path, name));
        }
        return this._dirContent;
    }

    get SubFolders () {
        return this._getDirContent()
            .filter(path => getSafeStat(path).isDirectory)
            .map(path => new Folder(path));
    }

    get Files () {
        return this._getDirContent()
            .filter(path => getSafeStat(path).isFile)
            .map(path => new File(path));
    }

}

class ScriptingFileSystemOjbect {

    OpenTextFile (path, iomode, create) {
        return new File(normalizePath(path), iomode === 8 && create === true);
    }

    FileExists (path) {
        return getSafeStat(normalizePath(path)).isFile;
    }

    GetFile (path) {
        return new File(normalizePath(path));
    }

    DeleteFile (path) {
        fs.unlinkSync(normalizePath(path));
    }

    FolderExists (path) {
        return getSafeStat(normalizePath(path)).isDirectory;
    }

    CreateFolder (path) {
        fs.mkdirSync(normalizePath(path));
    }

    GetFolder (path) {
        return new Folder(normalizePath(path));
    }

    DeleteFolder (path) {
        fs.rmdirSync(normalizePath(path));
    }

}

module.exports = ScriptingFileSystemOjbect;
