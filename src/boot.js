/**
 * @file Host detection, non-UMD loader
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*exported _GPF_HOST*/ // Host types
/*exported _GpfFunc*/ // Function
/*exported _gpfBootImplByHost*/ // Boot host specific implementation per host
/*exported _gpfDosPath*/ // DOS-like path
/*exported _gpfEmptyFunc*/ // An empty function
/*exported _gpfExit*/ // Exit function
/*exported _gpfHost*/ // Host type
/*exported _gpfIgnore*/ // Helper to remove unused parameter warning
/*exported _gpfMainContext*/ // Main context object
/*exported _gpfMsFSO*/ // Scripting.FileSystemObject activeX
/*exported _gpfNodeFs*/ // Node/PhantomJS require("fs")
/*exported _gpfNodePath*/ // Node require("path")
/*exported _gpfSyncReadSourceJSON*/ // Reads a source json file (only in source mode)
/*exported _gpfVersion*/ // GPF version
/*exported _gpfWebDocument*/ // Browser document object
/*exported _gpfWebWindow*/ // Browser window object
/*eslint-disable no-unused-vars*/
/*#endif*/

/*jshint browser: true, node: true, phantom: true, rhino: true, wsh: true*/
/*eslint-env browser, node, phantomjs, rhino, wsh*/

// An empty function
function _gpfEmptyFunc () {}

var
    /**
     * GPF Version
     * @since 0.1.5
     */
    _gpfVersion = "0.2.6-alpha",

    /**
     * Host constants
     * @since 0.1.5
     */
    _GPF_HOST = {
        BROWSER:    "browser",
        NASHORN:    "nashorn",
        NODEJS:     "nodejs",
        PHANTOMJS:  "phantomjs",
        RHINO:      "rhino",
        UNKNOWN:    "unknown",
        WSCRIPT:    "wscript"
    },

    /**
     * Current host type
     *
     * @type {_GPF_HOST}
     * @since 0.1.5
     */
    _gpfHost = _GPF_HOST.UNKNOWN,

    /**
     * Indicates that paths are DOS-like (i.e. case insensitive with /)
     * @since 0.1.5
     */
    _gpfDosPath = false,

    // https://github.com/jshint/jshint/issues/525
    _GpfFunc = Function, // avoid JSHint error

    /*jshint -W040*/ // This is the common way to get the global context
    /**
     * Main context object
     *
     * @type {Object}
     * @since 0.1.5
     */
    _gpfMainContext = new _GpfFunc("return this")(), // Non-strict function returns global context
    /*jshint +W040*/

    /**
     * Helper to ignore unused parameter
     *
     * @param {*} param
     * @since 0.1.5
     */
    /*gpf:nop*/ _gpfIgnore = _gpfEmptyFunc,

    /**
     * Exit function
     *
     * @param {Number} code
     * @since 0.1.5
     */
    _gpfExit = _gpfEmptyFunc,

    /**
     * Browser window object
     *
     * @type {Object}
     * @since 0.1.5
     */
    _gpfWebWindow,

    /**
     * Browser [document](https://developer.mozilla.org/en-US/docs/Web/API/Document) object
     *
     * @type {Object}
     * @since 0.1.5
     */
    _gpfWebDocument,

    /**
     * [Scripting.FileSystemObject](https://msdn.microsoft.com/en-us/library/aa711216(v=vs.71).aspx) Object
     *
     * @type {Object}
     * @since 0.1.5
     */
    _gpfMsFSO,

    /**
     * Node [require("fs")](https://nodejs.org/api/fs.html)
     *
     * @type {Object}
     * @since 0.1.5
     */
    _gpfNodeFs,

    /**
     * Node [require("path")](https://nodejs.org/api/path.html)
     *
     * @type {Object}
     * @since 0.1.5
     */
    _gpfNodePath,

    /**
     * Boot host specific implementation per host
     *
     * @type {Object}
     * @since 0.2.1
     */
    _gpfBootImplByHost = {};

/*#ifdef(DEBUG)*/

_gpfVersion += "-debug";

/*#endif*/

/*#ifndef(UMD)*/

_gpfVersion += "-source";

/**
 * Synchronous read function
 *
 * @param {String} srcFileName
 * @return {String} content of the srcFileName
 * @since 0.1.5
 */
var _gpfSyncReadForBoot;

/*#endif*/

/* Host detection */

// Microsoft cscript / wscript
if ("undefined" !== typeof WScript) {
    _gpfHost = _GPF_HOST.WSCRIPT;
    _gpfDosPath = true;

    /*#ifndef(UMD)*/
    /*eslint-disable new-cap*/

    _gpfMsFSO = new ActiveXObject("Scripting.FileSystemObject");

    _gpfSyncReadForBoot = function (srcFileName) {
        var srcFile = _gpfMsFSO.OpenTextFile(srcFileName, 1),
            srcContent = srcFile.ReadAll();
        srcFile.Close();
        return srcContent;
    };

    /*eslint-enable new-cap*/
    /*#endif*/

} else if ("undefined" !== typeof print && "undefined" !== typeof java) {
    _gpfDosPath = String(java.lang.System.getProperty("file.separator")) === "\\";

    if ("undefined" === typeof readFile) {
        _gpfHost = _GPF_HOST.NASHORN;

        /*#ifndef(UMD)*/

        _gpfSyncReadForBoot = function (srcFileName) {
            return [].join.call(java.nio.file.Files.readAllLines(java.nio.file.Paths.get(srcFileName)), "\n");
        };

        /*#endif*/

    } else {
        _gpfHost = _GPF_HOST.RHINO;

        /*#ifndef(UMD)*/

        _gpfSyncReadForBoot = readFile;

        /*#endif*/

    }

// PhantomJS - When used as a command line (otherwise considered as a browser)
} else if ("undefined" !== typeof phantom && phantom.version && !document.currentScript) {
    _gpfHost = _GPF_HOST.PHANTOMJS;
    _gpfDosPath = require("fs").separator === "\\";
    _gpfMainContext = window;

    /*#ifndef(UMD)*/

    _gpfNodeFs =  require("fs");

    _gpfSyncReadForBoot = function (srcFileName) {
        return _gpfNodeFs.read(srcFileName);
    };

    /*#endif*/

// Nodejs
} else if ("undefined" !== typeof module && module.exports) {
    _gpfHost = _GPF_HOST.NODEJS;
    _gpfNodePath = require("path");
    _gpfDosPath = _gpfNodePath.sep === "\\";
    _gpfMainContext = global;

    /*#ifndef(UMD)*/
    /*eslint-disable no-sync*/ // Simpler this way

    _gpfNodeFs =  require("fs");

    _gpfSyncReadForBoot = function (srcFileName) {
        return _gpfNodeFs.readFileSync(srcFileName).toString();
    };

    /*#endif*/

// Browser
/* istanbul ignore else */ // unknown.1
} else if ("undefined" !== typeof window) {

    _gpfHost = _GPF_HOST.BROWSER;
    _gpfMainContext = window;

    /*#ifndef(UMD)*/

    _gpfSyncReadForBoot = function (srcFileName) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", srcFileName, false);
        xhr.send();
        return xhr.responseText;
    };

    /*#endif*/

}

/*#ifndef(UMD)*/

/**
 * Loading sources occurs here for the non UMD version.
 * UMD versions (debug / release) will have everything concatenated.
 * @since 0.1.5
 */

// Need to create the gpf name 'manually'
_gpfMainContext.gpf = {
    internals: {} // To support testable internals
};

/**
 * Contains the root path of GPF sources
 *
 * @name gpfSourcesPath
 * @type {String}
 * @private
 * @since 0.0.1
 */

/**
 * Reads a source file (only in source mode)
 *
 * NOTE this method is available only when running the source version
 *
 * @param {String} sourceFileName Source file name (relative to src folder)
 * @return {String} Source content
 * @since 0.1.7
 */
function _gpfSyncReadSourceJSON (sourceFileName) {
    /*jslint evil: true*/
    var result;
    eval("result = " + _gpfSyncReadForBoot(gpfSourcesPath + sourceFileName) + ";"); //eslint-disable-line no-eval
    return result;
}

/**
 * Load content of all sources
 *
 * @return {String} Consolidated sources
 * @since 0.1.9
 */
function _gpfLoadSources () { //jshint ignore:line
    /*jslint evil: true*/
    var sourceListContent = _gpfSyncReadForBoot(gpfSourcesPath + "sources.json"),
        _gpfSources,
        allContent = [],
        idx = 0,
        source;
    eval("_gpfSources = " + sourceListContent + ";"); //eslint-disable-line no-eval
    for (; idx < _gpfSources.length; ++idx) {
        source = _gpfSources[idx];
        if (source.load !== false) {
            allContent.push(_gpfSyncReadForBoot(gpfSourcesPath + source.name + ".js"));
        }
    }
    return allContent.join("\n");
}

/*jshint ignore:start*/ // Best way I found
eval(_gpfLoadSources()); //eslint-disable-line no-eval
/*jshint ignore:end*/

/*#endif*/

/**
 * Host type enumeration
 *
 * @enum {String}
 * @readonly
 * @since 0.1.5
 */
gpf.hosts = {
    /**
     * Any browser (phantomjs is recognized separately)
     * @since 0.1.5
     */
    browser: _GPF_HOST.BROWSER,
    /**
     * [Nashorn](https://en.wikipedia.org/wiki/Nashorn_%28JavaScript_engine%29)
     * @since 0.2.4
     */
    nashorn: _GPF_HOST.NASHORN,
    /**
     * [NodeJs](http://nodejs.org/)
     * @since 0.1.5
     */
    nodejs: _GPF_HOST.NODEJS,
    /**
     * [PhantomJS](http://phantomjs.org/)
     * @since 0.1.5
     */
    phantomjs: _GPF_HOST.PHANTOMJS,
    /**
     * [Rhino](http://developer.mozilla.org/en/docs/Rhino)
     * @since 0.1.5
     */
    rhino: _GPF_HOST.RHINO,
    /**
     * Unknown (detection failed or the host is unknown)
     * @since 0.1.5
     */
    unknown: _GPF_HOST.UNKNOWN,
    /**
     * [cscript/wscript](http://technet.microsoft.com/en-us/library/bb490887.aspx)
     * @since 0.1.5
     */
    wscript: _GPF_HOST.WSCRIPT
};

/**
 * Returns the detected host type
 *
 * @return {gpf.hosts} Host type
 * @since 0.1.5
 */
gpf.host = function () {
    return _gpfHost;
};

/**
 * Returns the current version
 *
 * @return {String} Version
 * @since 0.1.5
 */
gpf.version = function () {
    return _gpfVersion;
};
