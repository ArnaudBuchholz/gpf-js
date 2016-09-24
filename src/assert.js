/**
 * @file Assertion helpers
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfEmptyFunc*/ // An empty function
/*exported _gpfAssert*/ // Assertion method
/*exported _gpfAsserts*/ // Multiple assertion method
/*#endif*/

var _gpfAssert,
    _gpfAsserts;

/**
 * Assertion helper
 *
 * @param {Boolean} condition May be a truthy value
 * @param {String} message Assertion message (to explain the violation if it fails)
 */
function _gpfAssertImpl (condition, message) {
    if (undefined === message) {
        message = "Assertion with no message";
        condition = false;
    }
    if (!condition) {
        console.warn("ASSERTION FAILED: " + message);
        throw gpf.Error.assertionFailed({
            message: message
        });
    }
}

/**
 * Batch assertion helper
 *
 * @param {Object} messages Dictionary of messages (value being the condition)
 */
function _gpfAssertsImpl (messages) {
    for (var message in messages) {
        /* istanbul ignore else */
        if (messages.hasOwnProperty(message)) {
            _gpfAssertImpl(messages[message], message);
        }
    }
}

// @inheritdoc _gpfAssertImpl
gpf.assert = _gpfAssertImpl;

// @inheritdoc _gpfAssertsImpl
gpf.asserts = _gpfAssertsImpl;

/*#ifdef(DEBUG)*/

// DEBUG specifics

_gpfAssert = _gpfAssertImpl;
_gpfAsserts = _gpfAssertsImpl;

/* istanbul ignore if */ // Because tested in DEBUG
if (!_gpfAssert) {

/*#else*/

    /*gpf:nop*/ _gpfAssert = _gpfEmptyFunc;
    /*gpf:nop*/ _gpfAsserts = _gpfEmptyFunc;

/*#endif*/

/*#ifdef(DEBUG)*/

}

/*#endif*/
