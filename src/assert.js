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
 * @param {Boolean} condition Truthy / [Falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) value
 * @param {String} message Assertion message explaining the violation when the condition is false
 * @throws {gpf.Error.AssertionFailed}
 */
function _gpfAssertImpl (condition, message) {
    if (undefined === message) {
        message = "Assertion with no message";
        condition = false;
    }
    if (!condition) {
        console.warn("ASSERTION FAILED: " + message);
        gpf.Error.assertionFailed({
            message: message
        });
    }
}

/**
 * Batch assertion helper
 *
 * @param {Object} assertions Dictionary of messages associated to condition values
 * @throws {gpf.Error.AssertionFailed}
 */
function _gpfAssertsImpl (assertions) {
    for (var message in assertions) {
        /* istanbul ignore else */
        if (assertions.hasOwnProperty(message)) {
            _gpfAssertImpl(assertions[message], message);
        }
    }
}

/** @gpf:sameas _gpfAssertImpl */
gpf.assert = _gpfAssertImpl;

/** @gpf:sameas _gpfAssertsImpl */
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
