/**
 * @file WScript specific File System implementation
 */
 /*#ifndef(UMD)*/
 "use strict";
 /*global _GPF_HOST*/ // Host types
 /*global _gpfReadImplByHost*/ // gpf.read per host
 /*global _gpfMsFSO*/ // Scripting.FileSystemObject activeX
 /*#endif*/

 _gpfReadImplByHost[_GPF_HOST.WSCRIPT] = function (path) {
     return new Promise(function (resolve) {
         var file = _gpfMsFSO.OpenTextFile(path, 1, false);
         resolve(file.ReadAll());
         file.Close();
     });
 };
