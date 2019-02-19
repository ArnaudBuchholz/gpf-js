/**
 * @file ES6 decorators implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*exported _gpfRequireEs6DecoratorPreprocess*/
/*#endif*/

var _gpfRequireEs6DecoratorREClassDetect = /\bclass\b\s(\w+)/;


function _gpfRequireEs6DecoratorExtract (source) {
    var INITIAL = 0,
        CLASS = 1,
        IN_MEMBER = 2,
        states = {
          0 /*INITIAL*/: function (line, offset) {
              _gpfRequireEs6DecoratorREClassDetect.lastIndex = offset;
              var match = _gpfRequireEs6DecoratorREClassDetect.exec(line);
              if (match) {
                return stats[CLASS](line, _gpfRequireEs6DecoratorREClassDetect.lastIndex);
              }
          },
          1 /*CLASS*/: function (line, offset) {
              
          }
        },
        state = 0;
    source.split("\n").forEach(function (line) {

    });
}

function _gpfRequireEs6DecoratorPreprocess (source) {
    var decorators = _gpfRequireEs6DecoratorExtract(source);
    if (decorators) {
        return _gpfRequireEs6DecoratorInstrument(source, decorators);
    }
    return source;
}

/*#ifndef(UMD)*/

gpf.internals._gpfRequireEs6DecoratorExtract = _gpfRequireEs6DecoratorExtract;

/*#endif*/
