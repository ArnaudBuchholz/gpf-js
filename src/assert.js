/*#ifndef(UMD)*/
"use strict";
/*global _gpfEmptyFunc*/ // An empty function
/*exported _gpfAssert*/ // Assertion method
/*exported _gpfAsserts*/ // Multiple assertion method
/*#endif*/

var _gpfAssert,
    _gpfAsserts;

/*#ifdef(DEBUG)*/

// DEBUG specifics

/* istanbul ignore next */ // no ASSERT should pop during tests
/**
 * Assertion helper
 *
 * @param {Boolean} condition May be a truthy value
 * @param {String} message Assertion message (to explain the violation if it fails)
 */
_gpfAssert = function (condition, message) {
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
};

/**
 * Batch assertion helper
 *
 * @param {Object} messages Dictionary of messages (value being the condition)
 */
_gpfAsserts = function (messages) {
    for (var message in messages) {
        /* istanbul ignore else */
        if (messages.hasOwnProperty(message)) {
            _gpfAssert(messages[message], message);
        }
    }
};

/* istanbul ignore if */ // Because tested in DEBUG
if (!_gpfAssert) {

    /*#else*/

    /*gpf:nop*/ _gpfAssert = _gpfEmptyFunc;
    /*gpf:nop*/ _gpfAsserts = _gpfEmptyFunc;

    /*#endif*/

    /*#ifdef(DEBUG)*/

}

/*#endif*/
