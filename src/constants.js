/*#ifndef(UMD)*/
"use strict";
/*jshint -W098*/ // This is a constant list, they won't be used in here
/*jshint -W079*/ // Globals are also copied here
/*#endif*/

//region boot
/*global _gpfContext*/ // Main context object
/*global _gpfDosPath*/ // DOS-like path
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfExit*/ // Exit function
/*global _gpfFinishLoading*/ // Ends the loading (declared in boot.js)
/*global _gpfFSRead*/ // Phantom/Node File System read text file method (boot)
/*global _gpfHost*/ // Host type
/*global _gpfInBrowser*/ // The current host is a browser like
/*global _gpfInNode*/ // The current host is a nodeJS like
/*global _gpfMsFSO*/ // Scripting.FileSystemObject activeX
/*global _gpfNodeFs*/ // Node require("fs")
/*global _gpfNodePath*/ // Node require("path")
/*global _gpfResolveScope*/ // Translate the parameter into a valid scope
/*global _gpfVersion*/ // GPF version
/*global _gpfWebDocument*/ // Browser document object
/*global _gpfWebHead*/ // Browser head tag
/*global _gpfWebRawInclude*/ // Raw web include
/*global _gpfWebWindow*/ // Browser window object
/*global gpfSourcesPath*/ // Global source path
//endregion
//region compatibility
/*global _gpfArraySlice*/ // Shortcut on Array.prototype.slice
/*global _gpfSetReadOnlyProperty*/ // gpf.setReadOnlyProperty
//endregion
//region constants
/*global _GPF_EVENT_ANY*/ // gpf.events.EVENT_ANY
/*global _GPF_EVENT_CONTINUE*/ // gpf.events.EVENT_CONTINUE
/*global _GPF_EVENT_DATA*/ // gpf.events.EVENT_DATA
/*global _GPF_EVENT_END_OF_DATA*/ // gpf.events.EVENT_END_OF_DATA
/*global _GPF_EVENT_ERROR*/ // gpf.events.EVENT_ERROR
/*global _GPF_EVENT_READY*/ // gpf.events.EVENT_READY
/*global _GPF_EVENT_STOP*/ // gpf.events.EVENT_STOP
/*global _GPF_EVENT_STOPPED*/ // gpf.events.EVENT_STOPPED
/*global _GPF_FS_TYPE_DIRECTORY*/ // gpf.fs.TYPE_DIRECTORY
/*global _GPF_FS_TYPE_FILE*/ // gpf.fs.TYPE_FILE
/*global _GPF_FS_TYPE_NOT_FOUND*/ // gpf.fs.TYPE_NOT_FOUND
/*global _GPF_FS_TYPE_UNKNOWN*/ // gpf.fs.TYPE_UNKNOWN
/*global _gpfAlpha*/ // Letters (lowercase)
/*global _gpfALPHA*/ // Letters (uppercase)
/*global _gpfDigit*/ // Digits
/*global _gpfFalseFunc*/ // An empty function returning false
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfIdentifierFirstChar*/ // allowed first char in an identifier
/*global _gpfIdentifierOtherChars*/ // allowed other chars in an identifier
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfJsKeywords*/ //  List of JavaScript keywords
/*global _gpfMax31*/ // Max value on 31 bits
/*global _gpfMax32*/ // Max value on 32 bits
//endregion
//region events
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
//endregion
//region include
//endregion
//region base
/*global _gpfArrayEachWithResult*/ //gpf.each implementation on array
/*global _gpfArrayOrItem*/ // Common way to code IReadOnlyArray::getItem
/*global _gpfDictionaryEachWithResult*/ //gpf.each implementation on dictionary
/*global _gpfExtend*/ // gpf.extend
/*global _gpfIsArrayLike*/ // Return true if the parameter looks like an array
/*global _gpfStringCapitalize*/ // Capitalize the string
/*global _gpfStringEscapeFor*/ // Make the string content compatible with lang
/*global _gpfStringReplaceEx*/ // String replacement using dictionary map
//endregion
//region like
//endregion
//region callback
/*global _gpfBuildParamArray*/ // Build a parameter array
/*global _gpfDoApply*/ // Apply the parameter array through a function
//endregion
//region dispatch
//endregion
//region mimetype
//endregion
//region async
/*global _gpfDefer*/ // Defer the execution of the callback
//endregion
//region bin
//endregion
//region json
/*global _gpfJsonParse*/ // JSON.parse
/*global _gpfJsonStringify*/ // JSON.stringify
//endregion
//region path
/*global _gpfPathDecompose*/ // Normalize path and returns an array of parts
//endregion
//region path_matcher
//endregion
//region error
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
//endregion
//region javascript
//endregion
//region csv
/*global _gpfCsvParse*/ // CSV parsing function
//endregion
//region define
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfGenDefHandler*/ // Class handler for class types (interfaces...)
/*global _gpfGetClassDefinition*/ // Get GPF class definition for a constructor
//endregion
//region attributes
/*global _gpfA*/ // gpf.attributes
/*global _gpfAAdd*/ // Shortcut for gpf.attributes.add
/*global _gpfDefAttr*/ // gpf.define for attributes
//endregion
//region a_attributes
//endregion
//region a_class
/*global _gpfANoSerial*/ // gpf.attributes.ClassNonSerializedAttribute
//endregion
//region interfaces
/*global _gpfI*/ // gpf.interfaces
/*global _gpfDefIntrf*/ // gpf.define for interfaces
//endregion
//region i_enumerator
/*global _gpfArrayEnumerator*/ // Create an IEnumerator from an array
//endregion
//region i_array
//endregion
//region i_stream
//endregion
//region i_filestorage
//endregion
//region fs
//endregion
//region fs_node
//endregion


/*global _gpfFromXml*/ // XML deserializer
/*global _gpfToXml*/ // XML serializer
/*global _gpfIsValidXmlName*/ // XML name validation
/*global _GpfXmlBase*/ // XML base attribute
/*global _GpfXmlIgnore*/ // $XmlIgnore
/*global _GpfXmlAttribute*/ // $XmlAttribute
/*global _GpfXmlRawElement*/ // XmlRawElementAttribute
/*global _GpfXmlElement*/ // $XmlElement
/*global _GpfXmlList*/ // $XmlList

var
/*#ifdef(RELEASE)*/
    _gpfTypeofBoolean = "boolean",
    _gpfTypeofFunction = "function",
    _gpfTypeofNumber = "number",
    _gpfTypeofObject = "object",
    _gpfTypeofString = "string",
    _gpfTypeofUndefined = "undefined",
    _gpfUndefined = void 0,
    _gpfTrue = !!1,
    _gpfFalse = !_gpfTrue,
    _gpfNull = null,

    /*#define "boolean" _gpfTypeofBoolean*/
    /*#define "function" _gpfTypeofFunction*/
    /*#define "number" _gpfTypeofNumber*/
    /*#define "object" _gpfTypeofObject*/
    /*#define "string" _gpfTypeofString*/
    /*#define "undefined" _gpfTypeofUndefined*/
    /*#define undefined _gpfUndefined*/
    /*#define true _gpfTrue*/
    /*#define false _gpfFalse*/
    /*#define null _gpfNull*/
/*#endif*/

    //region Events

    _GPF_EVENT_ANY                  = "*",
    _GPF_EVENT_ERROR                = "error",
    _GPF_EVENT_READY                = "ready",
    _GPF_EVENT_DATA                 = "data",
    _GPF_EVENT_END_OF_DATA          = "endOfData",
    _GPF_EVENT_CONTINUE             = "continue",
    _GPF_EVENT_STOP                 = "stop",
    _GPF_EVENT_STOPPED              = "stopped",

    //endregion

    //region File system constants

    _GPF_FS_TYPE_NOT_FOUND          = 0,
    _GPF_FS_TYPE_FILE               = 1,
    _GPF_FS_TYPE_DIRECTORY          = 2,
    _GPF_FS_TYPE_UNKNOWN            = 99,

    //endregion

    // https://github.com/jshint/jshint/issues/525
    _GpfFunc = Function, // avoid JSHint error

    /**
     * Helper to ignore unused parameter
     *
     * @param {*} param
     * @private
     */
    _gpfIgnore = _gpfEmptyFunc,

    /**
     * An empty function returning false
     *
     * @result {Boolean} False
     * @private
     */
    _gpfFalseFunc = function () {
        return false;
    },

    /**
     * Create a new function using the source
     * In DEBUG mode, it catches any error to signal the problem
     *
     * @param {String[]} [params=undefined] params Parameter names list
     * @param {String} source
     * @return {Function}
     * @private
     */
    _gpfFunc = function (params, source) {
        var args;
        if (undefined === source) {
            source = params;
            params = [];
        }
        gpf.ASSERT("string" === typeof source && source.length,
            "Source expected (or use _gpfEmptyFunc)");
/*#ifdef(DEBUG)*/
        try {
/*#endif*/
            if (0 === params.length) {
                return _GpfFunc(source);
            } else {
                args = [].concat(params);
                args.push(source);
                return _GpfFunc.apply(null, args);
            }
/*#ifdef(DEBUG)*/
        } catch (e) {
            console.error("An exception occurred compiling:\r\n" + source);
            return null;
        }
/*#endif*/
    },

    /**
     * Max value on 31 bits
     *
     * @type {Number}
     * @private
     */
    _gpfMax31 = 0x7FFFFFFF,

    /**
     * Max value on 32 bits
     *
     * @type {Number}
     * @private
     */
    _gpfMax32 =  0xFFFFFFFF,

    /**
     * Letters (lowercase)
     *
     * @type {String}
     * @private
     */
    _gpfAlpha = "abcdefghijklmnopqrstuvwxyz",

    /**
     * Letters (uppercase)
     *
     * @type {String}
     * @private
     */
    _gpfALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",

    /**
     * Digits
     *
     * @type {String}
     * @private
     */
    _gpfDigit = "0123456789",

    /**
     * List of allowed first char in an identifier
     *
     * @type {String}
     * @private
     */
    _gpfIdentifierFirstChar = _gpfAlpha + _gpfALPHA + "_$",

    /**
     * List of allowed other chars in an identifier
     *
     * @type {String}
     * @private
     */
    _gpfIdentifierOtherChars = _gpfAlpha + _gpfALPHA + _gpfDigit + "_$",

    /**
     * List of JavaScript keywords
     *
     * @type {String[]}
     * @private
     */
    _gpfJsKeywords = ("break,case,catch,continue,debugger,default,delete,do,"
        + "else,finally,for,function,if,in,instanceof,new,return,switch,"
        + "this,throw,try,typeof,var,void,while,with").split(",")

    ;

/*#ifndef(UMD)*/
// Mandatory to support boot loading in a browser (removed when UMD is used)
gpf._constants = true;
/*#endif*/