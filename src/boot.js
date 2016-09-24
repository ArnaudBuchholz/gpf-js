/**
 * @file Host detection, non-UMD loader
 */
/*#ifndef(UMD)*/
"use strict";
/*exported _GPF_HOST_BROWSER*/ // gpf.HOST_BROWSER
/*exported _GPF_HOST_NODEJS*/ // gpf.HOST_NODEJS
/*exported _GPF_HOST_PHANTOMJS*/ // gpf.HOST_PHANTOMJS
/*exported _GPF_HOST_RHINO*/ // gpf.HOST_RHINO
/*exported _GPF_HOST_UNKNOWN*/ // gpf.HOST_UNKNOWN
/*exported _GPF_HOST_WSCRIPT*/ // gpf.HOST_WSCRIPT
/*exported _gpfDosPath*/ // DOS-like path
/*exported _gpfEmptyFunc*/ // An empty function
/*exported _gpfExit*/ // Exit function
/*exported _gpfHost*/ // Host type
/*exported _gpfIgnore*/ // Helper to remove unused parameter warning
/*exported _gpfInBrowser*/ // The current host is a browser like
/*exported _gpfInNode*/ // The current host is a nodeJS like
/*exported _gpfMainContext*/ // Main context object
/*exported _gpfMsFSO*/ // Scripting.FileSystemObject activeX
/*exported _gpfNodeFs*/ // Node require("fs")
/*exported _gpfNodePath*/ // Node require("path")
/*exported _gpfVersion*/ // GPF version
/*exported _gpfWebDocument*/ // Browser document object
/*exported _gpfWebHead*/ // Browser head tag
/*exported _gpfWebWindow*/ // Browser window object
/*eslint-disable no-unused-vars*/
/*#endif*/

// An empty function
function _gpfEmptyFunc () {}

var
    // GPF version
    _gpfVersion = "0.1.5-alpha",

    // Host type constants
    _GPF_HOST_BROWSER               = "browser",
    /*jshint browser: true*/
    /*eslint-env browser*/

    _GPF_HOST_NODEJS                = "nodejs",
    /*jshint node: true*/
    /*eslint-env node*/

    _GPF_HOST_PHANTOMJS             = "phantomjs",
    /*jshint phantom: true*/
    /*eslint-env phantomjs*/

    _GPF_HOST_RHINO                 = "rhino",
    /*jshint rhino: true*/
    /*eslint-env rhino*/

    _GPF_HOST_UNKNOWN               = "unknown",

    _GPF_HOST_WSCRIPT               = "wscript",
    /*jshint wsh: true*/
    /*eslint-env wsh*/

    // Host type, see _GPF_HOST_xxx
    _gpfHost = _GPF_HOST_UNKNOWN,

    // Indicates that paths are DOS-like (i.e. case insensitive with /)
    _gpfDosPath = false,

    /*jshint -W040*/ // This is the common way to get the global context
    // Main context object
    _gpfMainContext = this, //eslint-disable-line no-invalid-this, consistent-this
    /*jshint +W040*/

    /**
     * Helper to ignore unused parameter
     *
     * @param {*} param
     */
    /*gpf:nop*/ _gpfIgnore = _gpfEmptyFunc,

    /**
     * Exit function
     *
     * @param {Number} code
     */
    _gpfExit = _gpfEmptyFunc,

    // The current host is a nodeJS like
    _gpfInNode = false,

    // The current host is a browser like
    _gpfInBrowser = false,

    /**
     * Browser window object
     *
     * @type {Object}
     */
    _gpfWebWindow,

    /**
     * Browser document object
     *
     * @type {Object}
     */
    _gpfWebDocument,

    /**
     * Browser head tag
     *
     * @type {Object}
     */
    _gpfWebHead,

    /**
     * Scripting.FileSystemObject activeX
     *
     * @type {Object}
     */
    _gpfMsFSO,

    /**
     * Node require("fs")
     *
     * @type {Object}
     */
    _gpfNodeFs,

    /**
     * Node require("path")
     *
     * @type {Object}
     */
    _gpfNodePath;

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
 */
var _gpfSyncReadForBoot;

/*#endif*/

/* Host detection */
/* istanbul ignore next */

// Microsoft cscript / wscript
if ("undefined" !== typeof WScript) {
    _gpfHost = _GPF_HOST_WSCRIPT;
    _gpfDosPath = true;

/*#ifndef(UMD)*/
    /*eslint-disable new-cap*/

    _gpfMsFSO = new ActiveXObject("Scripting.FileSystemObject");

    _gpfSyncReadForBoot = function (srcFileName) {
        var srcFile = _gpfMsFSO.OpenTextFile(srcFileName),
            srcContent = srcFile.ReadAll();
        srcFile.Close();
        return srcContent;
    };

    /*eslint-enable new-cap*/
/*#endif*/

} else if ("undefined" !== typeof print && "undefined" !== typeof java) {
    _gpfHost = _GPF_HOST_RHINO;
    _gpfDosPath = false;

/*#ifndef(UMD)*/

    _gpfSyncReadForBoot = readFile;

/*#endif*/

// PhantomJS
} else if ("undefined" !== typeof phantom && phantom.version) {
    _gpfHost = _GPF_HOST_PHANTOMJS;
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
    _gpfHost = _GPF_HOST_NODEJS;
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
} else if ("undefined" !== typeof window) {
    _gpfHost = _GPF_HOST_BROWSER;
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
 */

// Need to create the gpf name 'manually'
_gpfMainContext.gpf = {
    internals: {} // To support testable internals
};

// gpfSourcesPath - if defined - gives the relative path to sources
function _gpfGetSourcesPath () {
    var result = gpfSourcesPath,
        pathSep;
    /* istanbul ignore next */ // Handled the right way with NodeJS
    if ("undefined" === typeof result) {
        result = "";
    } else {
        if (_gpfDosPath) {
            pathSep = "\\";
        } else {
            pathSep = "/";
        }
        if (result.charAt(result.length - 1) !== pathSep) {
            result += pathSep;
        }
    }
    return result;
}

function _gpfLoadSources () { //jshint ignore:line
    /*jslint evil: true*/
    var sourcePath = _gpfGetSourcesPath(),
        sourceListContent = _gpfSyncReadForBoot(sourcePath + "sources.json"),
        _gpfSources,
        allContent = [],
        idx = 0,
        source;
    eval("_gpfSources = " + sourceListContent + ";"); //eslint-disable-line no-eval
    for (; idx < _gpfSources.length; ++idx) {
        source = _gpfSources[idx];
        if (source.load !== false) {
            allContent.push(_gpfSyncReadForBoot(sourcePath + source.name + ".js"));
        }
    }
    return allContent.join("\r\n");
}

/*jshint ignore:start*/ // Best way I found
eval(_gpfLoadSources()); //eslint-disable-line no-eval
/*jshint ignore:end*/

/*#endif*/

/**
 * Returns a string identifying the detected host
 *
 * @return {String}
 * - gpf.HOST_WSCRIPT for cscript and wscript
 * - gpf.HOST_NODEJS for nodejs
 * - gpf.HOST_PHANTOMJS for phantomjs
 * - gpf.HOST_BROWSER for any browser
 * - gpf.HOST_UNKNOWN if not detected
 */
gpf.host = function () {
    return _gpfHost;
};

// Returns the current version
gpf.version = function () {
    return _gpfVersion;
};
