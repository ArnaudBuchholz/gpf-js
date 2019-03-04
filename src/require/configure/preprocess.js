/**
 * @file Require preprocess configuration
 * @since 0.2.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfRequireConfigureAddOption*/ // Declare a configuration option
/*#endif*/

/**
  * @typedef gpf.typedef.requireResource
  * @property {String} name Resource resolved name
  * @property {String} content Resource content
  * @property {String} type Resource type
  * @since 0.2.9
  */

/**
   * Mocked response callback
   *
   * @callback gpf.typedef.requirePreprocessFunc
   *
   * @param {gpf.typedef.requireResource} resource Resource definition
   * @return {Promise<gpf.typedef.requireResource>}
   * @since 0.2.9
   */

function _gpfRequireConfigureCheckPreprocess (value) {
    if (typeof value !== "function") {
        gpf.Error.invalidRequireConfigureOptionValue();
    }
}

function _gpfRequireConfigurePreprocess (context, value) {
    _gpfRequireConfigureCheckPreprocess(value);
    context.preprocess = value;
}

_gpfRequireConfigureAddOption("preprocess", _gpfRequireConfigurePreprocess);
