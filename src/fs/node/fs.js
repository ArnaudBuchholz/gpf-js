/**
 * @file NodeJS File system implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/
/*global _gpfHost*/
/*global _gpfSetHostFileStorage*/
/*global _gpfNodeFileStorage*/ // NodeJS file storage
/*#endif*/

if (_GPF_HOST.NODEJS === _gpfHost) {

    _gpfSetHostFileStorage(new _gpfNodeFileStorage());

}
