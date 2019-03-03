/**
 * @file Require preprocess configuration
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfRequireConfigureAddOption*/
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

   function _gpfRequireConfigurePreprocess (context, value) {
       context.preprocess = value;
   }

   _gpfRequireConfigureAddOption("preprocess", _gpfRequireConfigurePreprocess);
