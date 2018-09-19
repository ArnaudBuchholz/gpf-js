/**
 * @file Serializable property value converter
 * @since 0.2.8
 */
/*#ifndef(UMD)*/
"use strict";
/*exported _gpfSerialIdentityConverter*/ // Identity converter, returns passed value
/*#endif*/

/**
 * Converter function executed upen property value serialization
 *
 * @callback gpf.typedef.serialConverter
 *
 * @param {*} value The value to convert
 * @param {gpf.typedef.serializableProperty} property The property definition
 * @param {String} member The object member
 * @return {*} converter value
 */

/**
 * Identity converter, returns passed value
 *
 * @param {*} value The value to convert
 * @return {*} value
 */
function _gpfSerialIdentityConverter (value) {
    return value;
}
